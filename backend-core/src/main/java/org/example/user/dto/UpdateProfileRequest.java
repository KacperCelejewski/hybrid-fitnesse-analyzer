package org.example.user.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 100) String displayName,
        @Min(10) @Max(120) Integer age,
        @Min(20) @Max(300) Double weightKg,
        @Min(30) @Max(120) Integer restingHr,
        @Min(120) @Max(230) Integer maxHr
) {
}
