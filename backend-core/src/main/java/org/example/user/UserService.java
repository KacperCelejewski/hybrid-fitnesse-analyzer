package org.example.user;

import org.example.user.dto.ProfileResponse;
import org.example.user.dto.UpdateProfileRequest;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String email) {
        return ProfileResponse.from(requireUser(email));
    }

    @Transactional
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = requireUser(email);

        Integer restingHr = request.restingHr() != null ? request.restingHr() : user.getRestingHr();
        Integer maxHr = request.maxHr() != null ? request.maxHr() : user.getMaxHr();
        if (restingHr != null && maxHr != null && maxHr <= restingHr) {
            throw new IllegalArgumentException("Maximum heart rate must be greater than resting heart rate");
        }

        if (request.displayName() != null) {
            user.setDisplayName(request.displayName());
        }
        if (request.age() != null) {
            user.setAge(request.age());
        }
        if (request.weightKg() != null) {
            user.setWeightKg(request.weightKg());
        }
        if (request.restingHr() != null) {
            user.setRestingHr(request.restingHr());
        }
        if (request.maxHr() != null) {
            user.setMaxHr(request.maxHr());
        }

        return ProfileResponse.from(userRepository.save(user));
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
}
