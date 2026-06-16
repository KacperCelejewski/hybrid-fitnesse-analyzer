package org.example.training;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.example.user.User;

import java.time.Instant;
import java.time.LocalDate;

/**
 * A single training session logged by a user, together with the training load
 * estimated for it (in arbitrary units, AU) and the model used to compute it.
 */
@Entity
@Table(name = "training_sessions")
public class TrainingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "session_date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SportType type;

    @Column(name = "duration_min", nullable = false)
    private Integer durationMin;

    /** Session rating of perceived exertion on the CR-10 scale (1-10). */
    @Column(name = "rpe")
    private Integer rpe;

    /** Average heart rate in bpm (endurance sessions). */
    @Column(name = "avg_hr")
    private Integer avgHr;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "sets")
    private Integer sets;

    @Column(name = "notes", length = 1000)
    private String notes;

    /** Estimated training load in arbitrary units. */
    @Column(name = "load_au", nullable = false)
    private Double loadAu;

    @Column(name = "load_method", nullable = false, length = 20)
    private String loadMethod;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected TrainingSession() {
        // for JPA
    }

    @jakarta.persistence.PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public SportType getType() {
        return type;
    }

    public void setType(SportType type) {
        this.type = type;
    }

    public Integer getDurationMin() {
        return durationMin;
    }

    public void setDurationMin(Integer durationMin) {
        this.durationMin = durationMin;
    }

    public Integer getRpe() {
        return rpe;
    }

    public void setRpe(Integer rpe) {
        this.rpe = rpe;
    }

    public Integer getAvgHr() {
        return avgHr;
    }

    public void setAvgHr(Integer avgHr) {
        this.avgHr = avgHr;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Integer getSets() {
        return sets;
    }

    public void setSets(Integer sets) {
        this.sets = sets;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Double getLoadAu() {
        return loadAu;
    }

    public void setLoadAu(Double loadAu) {
        this.loadAu = loadAu;
    }

    public String getLoadMethod() {
        return loadMethod;
    }

    public void setLoadMethod(String loadMethod) {
        this.loadMethod = loadMethod;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
