package org.example.training;

import org.example.analytics.AnalyticsClient;
import org.example.training.dto.CreateSessionRequest;
import org.example.training.dto.SessionResponse;
import org.example.user.User;
import org.example.user.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TrainingSessionService {

    private final TrainingSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final AnalyticsClient analyticsClient;

    public TrainingSessionService(TrainingSessionRepository sessionRepository,
                                  UserRepository userRepository,
                                  AnalyticsClient analyticsClient) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.analyticsClient = analyticsClient;
    }

    @Transactional
    public SessionResponse create(String email, CreateSessionRequest request) {
        User user = requireUser(email);

        AnalyticsClient.LoadEstimate load = analyticsClient.estimate(
                request.type(), request.durationMin(), request.rpe(), request.avgHr(), user);

        TrainingSession session = new TrainingSession();
        session.setUser(user);
        session.setDate(request.date());
        session.setType(request.type());
        session.setDurationMin(request.durationMin());
        session.setRpe(request.rpe());
        session.setAvgHr(request.avgHr());
        session.setDistanceKm(request.distanceKm());
        session.setSets(request.sets());
        session.setNotes(request.notes());
        session.setLoadAu(load.loadAu());
        session.setLoadMethod(load.method());


        return SessionResponse.from(sessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> list(String email) {
        User user = requireUser(email);
        return sessionRepository.findByUserOrderByDateDescIdDesc(user)
                .stream()
                .map(SessionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public SessionResponse get(String email, Long id) {
        User user = requireUser(email);
        return sessionRepository.findByIdAndUser(id, user)
                .map(SessionResponse::from)
                .orElseThrow(SessionNotFoundException::new);
    }

    @Transactional
    public void delete(String email, Long id) {
        User user = requireUser(email);
        TrainingSession session = sessionRepository.findByIdAndUser(id, user)
                .orElseThrow(SessionNotFoundException::new);
        sessionRepository.delete(session);
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    public static class SessionNotFoundException extends RuntimeException {
        public SessionNotFoundException() {
            super("Training session not found");
        }
    }
}
