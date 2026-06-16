package org.example.auth.dto;

public record AuthResponse(
        String token,
        String tokenType,
        UserSummary user
) {
    public static AuthResponse of(String token, UserSummary user) {
        return new AuthResponse(token, "Bearer", user);
    }
}
