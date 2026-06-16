package org.example.user.dto;

import org.example.user.User;

public record ProfileResponse(
        Long id,
        String email,
        String displayName,
        Integer age,
        Double weightKg,
        Integer restingHr,
        Integer maxHr
) {
    public static ProfileResponse from(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getAge(),
                user.getWeightKg(),
                user.getRestingHr(),
                user.getMaxHr());
    }
}
