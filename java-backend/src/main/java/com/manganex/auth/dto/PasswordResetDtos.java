package com.manganex.auth.dto;

public class PasswordResetDtos {
    public static class ForgotPasswordRequest {
        private String email;

        public ForgotPasswordRequest() {}
        public ForgotPasswordRequest(String email) { this.email = email; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class ResetPasswordRequest {
        private String token;
        private String newPassword;

        public ResetPasswordRequest() {}
        public ResetPasswordRequest(String token, String newPassword) {
            this.token = token;
            this.newPassword = newPassword;
        }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class GenericResponse {
        private boolean success;
        private String message;

        public GenericResponse() {}
        public GenericResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}

