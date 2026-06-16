package org.example.training;

import org.example.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrainingSessionRepository extends JpaRepository<TrainingSession, Long> {

    List<TrainingSession> findByUserOrderByDateDescIdDesc(User user);

    Optional<TrainingSession> findByIdAndUser(Long id, User user);
}
