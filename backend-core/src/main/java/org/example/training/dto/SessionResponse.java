package org.example.training.dto;

import org.example.training.SportType;
import org.example.training.TrainingSession;

import java.time.LocalDate;

public record SessionResponse(
        Long id,
        LocalDate date,
        SportType type,
        Integer durationMin,
        Integer rpe,
        Integer avgHr,
        Double distanceKm,
        Integer sets,
        String notes,
        Double loadAu,
        String loadMethod
) {
    public static SessionResponse from(TrainingSession s) {
        return new SessionResponse(
                s.getId(),
                s.getDate(),
                s.getType(),
                s.getDurationMin(),
                s.getRpe(),
                s.getAvgHr(),
                s.getDistanceKm(),
                s.getSets(),
                s.getNotes(),
                s.getLoadAu(),
                s.getLoadMethod());
    }
}
