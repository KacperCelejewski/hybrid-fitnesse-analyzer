package org.example.training.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.example.training.SportType;

import java.time.LocalDate;

public record CreateSessionRequest(
        @NotNull LocalDate date,
        @NotNull SportType type,
        @NotNull @Positive @Max(1440) Integer durationMin,
        @Min(1) @Max(10) Integer rpe,
        @Min(1) @Max(250) Integer avgHr,
        @Positive Double distanceKm,
        @Positive Integer sets,
        @Size(max = 1000) String notes
) {
}
