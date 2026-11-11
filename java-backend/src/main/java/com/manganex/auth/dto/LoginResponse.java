package com.manganex.auth.dto;

public class LoginResponse {
    private boolean success;
    private String token;
    private String username;
    private String fullName;
    private String role;
    private String message;

    public LoginResponse() {}

    public LoginResponse(boolean success, String token, String username, String fullName, String role, String message) {
        this.success = success;
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.message = message;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

