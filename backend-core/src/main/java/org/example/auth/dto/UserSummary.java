package org.example.auth.dto;

import org.example.user.User;

public record UserSummary(
        Long id,
        String email,
        String displayName
) {
    public static UserSummary from(User user) {
        return new UserSummary(user.getId(), user.getEmail(), user.getDisplayName());
    }
}
