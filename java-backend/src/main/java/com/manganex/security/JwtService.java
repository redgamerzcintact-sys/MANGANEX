package com.manganex.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtService {

    private final Environment environment;
    private volatile SecretKey cachedSigningKey;

    @Value("${manganex.security.jwt.secret:}")
    private String secret;

    @Value("${manganex.security.jwt.expiration-ms:86400000}")
    private long expirationMs;

    public JwtService(Environment environment) {
        this.environment = environment;
    }

    private SecretKey getSigningKey() {
        SecretKey existing = this.cachedSigningKey;
        if (existing != null) {
            return existing;
        }
        synchronized (this) {
            if (this.cachedSigningKey != null) {
                return this.cachedSigningKey;
            }
            if (secret != null && !secret.isBlank()) {
                byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
                if (keyBytes.length < 32) {
                    throw new IllegalStateException("MANGANEX_JWT_SECRET must be at least 32 bytes.");
                }
                this.cachedSigningKey = Keys.hmacShaKeyFor(keyBytes);
                return this.cachedSigningKey;
            }
            boolean isProd = Arrays.stream(environment.getActiveProfiles())
                    .anyMatch(p -> "prod".equalsIgnoreCase(p) || "production".equalsIgnoreCase(p))
                    || "production".equalsIgnoreCase(System.getenv("ENVIRONMENT"));
            if (isProd) {
                throw new IllegalStateException("MANGANEX_JWT_SECRET must be configured in production.");
            }
            byte[] ephemeralBytes = new byte[64];
            new SecureRandom().nextBytes(ephemeralBytes);
            this.cachedSigningKey = Keys.hmacShaKeyFor(ephemeralBytes);
            return this.cachedSigningKey;
        }
    }

    public String generateToken(String username, String role, String fullName) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .claim("fullName", fullName)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("role", String.class);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token, String username) {
        final String extractedUser = extractUsername(token);
        return (extractedUser.equals(username) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}

