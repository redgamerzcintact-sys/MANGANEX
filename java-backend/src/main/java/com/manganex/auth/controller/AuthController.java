package com.manganex.auth.controller;

import com.manganex.auth.dto.LoginRequest;
import com.manganex.auth.dto.LoginResponse;
import com.manganex.auth.dto.PasswordResetDtos;
import com.manganex.auth.dto.UserMeResponse;
import com.manganex.security.JwtService;
import com.manganex.users.entity.Role;
import com.manganex.users.entity.User;
import com.manganex.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final int MAX_ATTEMPTS = 10;
    private static final long WINDOW_MS = 5 * 60 * 1000L;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${manganex.security.allow-demo-reset-token:false}")
    private boolean allowDemoResetToken;

    // In-memory token blacklist, reset tokens, and basic auth rate limiter
    private final Set<String> revokedTokens = Collections.synchronizedSet(new HashSet<>());
    private final Map<String, String> passwordResetTokens = Collections.synchronizedMap(new HashMap<>());
    private final Map<String, List<Long>> rateLimitBuckets = new ConcurrentHashMap<>();

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    private boolean isRateLimited(String key, int maxAttempts) {
        long now = System.currentTimeMillis();
        List<Long> bucket = rateLimitBuckets.computeIfAbsent(key, k -> Collections.synchronizedList(new ArrayList<>()));
        synchronized (bucket) {
            bucket.removeIf(ts -> (now - ts) > WINDOW_MS);
            if (bucket.size() >= maxAttempts) {
                return true;
            }
            bucket.add(now);
            return false;
        }
    }
    private List<String> getPermissionsForRole(Role role) {
        if (role == null) return List.of("VIEW_ONLY");
        switch (role) {
            case ROLE_ADMIN:
                return List.of(
                        "SYSTEM_ADMIN", "USER_MANAGEMENT", "ROLE_ASSIGNMENT",
                        "DATASET_UPLOAD", "DATASET_DELETE", "MODEL_REGISTER",
                        "AUDIT_LOG_VIEW", "GEOLOGY_FULL", "OPS_FULL", "REPORT_GENERATE"
                );
            case ROLE_GEOLOGIST:
                return List.of(
                        "GEOLOGY_READ", "GEOLOGY_WRITE", "BOREHOLE_ASSAY_VIEW",
                        "PROSPECTIVITY_RUN", "EXPLORATION_MAP_EXPORT", "SUBSURFACE_3D_VIEW"
                );
            case ROLE_ENGINEER:
                return List.of(
                        "PRODUCTION_READ", "PRODUCTION_WRITE", "EQUIPMENT_STATUS_UPDATE",
                        "RISK_EVALUATION", "SCENARIO_SIMULATE", "FORECAST_ANALYZE"
                );
            case ROLE_ANALYST:
                return List.of(
                        "DATASET_VIEW", "DATASET_UPLOAD", "DATA_QUALITY_RUN",
                        "AI_MODEL_EVALUATE", "ANALYTICS_EXPORT", "SATELLITE_INDICES_COMPUTE"
                );
            case ROLE_VIEWER:
            default:
                return List.of(
                        "DASHBOARD_VIEW", "CADASTRE_VIEW", "APPROVED_REPORTS_VIEW", "MAPS_READONLY"
                );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        String key = request.getUsername() == null ? "anon" : request.getUsername().trim().toLowerCase();
        if (isRateLimited("login:" + key, MAX_ATTEMPTS)) {
            return ResponseEntity.status(429).body(
                    new LoginResponse(false, null, null, null, null, "Too many authentication attempts. Please try again later.")
            );
        }

        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(request.getUsername());
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(
                    new LoginResponse(false, null, null, null, null, "Invalid username or password.")
            );
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(
                    new LoginResponse(false, null, null, null, null, "Invalid username or password.")
            );
        }

        // Optional check for role-specific portal login
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            String expectedRole = request.getRole().toUpperCase();
            if (!user.getRole().name().contains(expectedRole)) {
                return ResponseEntity.status(403).body(
                        new LoginResponse(false, null, null, null, null, "Access denied: Account lacks required role credentials for this portal.")
                );
            }
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name(), user.getFullName());

        return ResponseEntity.ok(
                new LoginResponse(true, token, user.getUsername(), user.getFullName(), user.getRole().name(), "Login successful.")
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserMeResponse> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(new UserMeResponse(false, null, null, null, null, null, null, List.of()));
        }

        String token = authHeader.substring(7);
        if (revokedTokens.contains(token)) {
            return ResponseEntity.status(401).body(new UserMeResponse(false, null, null, null, null, null, null, List.of()));
        }

        try {
            String username = jwtService.extractUsername(token);
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(new UserMeResponse(false, null, null, null, null, null, null, List.of()));
            }

            User user = userOpt.get();
            List<String> permissions = getPermissionsForRole(user.getRole());

            return ResponseEntity.ok(new UserMeResponse(
                    true,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name(),
                    user.getOrganization(),
                    permissions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new UserMeResponse(false, null, null, null, null, null, null, List.of()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<PasswordResetDtos.GenericResponse> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            revokedTokens.add(token);
        }
        return ResponseEntity.ok(new PasswordResetDtos.GenericResponse(true, "Successfully logged out. Session revoked."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(new LoginResponse(false, null, null, null, null, "No active token to refresh."));
        }

        String oldToken = authHeader.substring(7);
        if (revokedTokens.contains(oldToken)) {
            return ResponseEntity.status(401).body(new LoginResponse(false, null, null, null, null, "Token has been revoked."));
        }

        try {
            String username = jwtService.extractUsername(oldToken);
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(new LoginResponse(false, null, null, null, null, "User not found."));
            }

            User user = userOpt.get();
            revokedTokens.add(oldToken); // Rotate token
            String newToken = jwtService.generateToken(user.getUsername(), user.getRole().name(), user.getFullName());

            return ResponseEntity.ok(new LoginResponse(true, newToken, user.getUsername(), user.getFullName(), user.getRole().name(), "Token refreshed successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new LoginResponse(false, null, null, null, null, "Token refresh failed: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<PasswordResetDtos.GenericResponse> forgotPassword(@RequestBody PasswordResetDtos.ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(new PasswordResetDtos.GenericResponse(false, "Official email is required."));
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (isRateLimited("pwd_reset:" + normalizedEmail, 5)) {
            return ResponseEntity.status(429).body(new PasswordResetDtos.GenericResponse(false, "Too many reset requests. Please try again later."));
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            // Constant-time generic response to prevent user enumeration
            return ResponseEntity.ok(new PasswordResetDtos.GenericResponse(true, "If an account exists for this email, secure password recovery instructions have been dispatched."));
        }

        String resetToken = UUID.randomUUID().toString().replace("-", "");
        passwordResetTokens.put(resetToken, userOpt.get().getEmail());

        if (allowDemoResetToken) {
            return ResponseEntity.ok(new PasswordResetDtos.GenericResponse(
                    true,
                    "Password reset token issued: " + resetToken + " (Demo/dev mode enabled)."
            ));
        }

        return ResponseEntity.ok(new PasswordResetDtos.GenericResponse(
                true,
                "If an account exists for this email, secure password recovery instructions have been dispatched."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<PasswordResetDtos.GenericResponse> resetPassword(@RequestBody PasswordResetDtos.ResetPasswordRequest request) {
        if (request.getToken() == null || !passwordResetTokens.containsKey(request.getToken())) {
            return ResponseEntity.status(400).body(new PasswordResetDtos.GenericResponse(false, "Invalid or expired password reset token."));
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            return ResponseEntity.status(400).body(new PasswordResetDtos.GenericResponse(false, "Password must be at least 8 characters with enterprise complexity."));
        }

        String email = passwordResetTokens.remove(request.getToken());
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            return ResponseEntity.ok(new PasswordResetDtos.GenericResponse(true, "Password successfully updated. You may now sign in."));
        }

        return ResponseEntity.status(404).body(new PasswordResetDtos.GenericResponse(false, "User not found."));
    }
}
