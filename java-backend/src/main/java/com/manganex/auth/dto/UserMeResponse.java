package com.manganex.auth.dto;

import java.util.List;

public class UserMeResponse {
    private boolean success;
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String organization;
    private List<String> permissions;

    public UserMeResponse() {}

    public UserMeResponse(boolean success, String id, String username, String email, String fullName, String role, String organization, List<String> permissions) {
        this.success = success;
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.organization = organization;
        this.permissions = permissions;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }
}

