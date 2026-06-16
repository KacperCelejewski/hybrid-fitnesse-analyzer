package org.example.auth;

import org.example.auth.dto.AuthResponse;
import org.example.auth.dto.LoginRequest;
import org.example.auth.dto.RegisterRequest;
import org.example.auth.dto.UserSummary;
import org.example.security.JwtService;
import org.example.user.User;
import org.example.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyUsedException();
        }
        User user = new User(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.displayName());
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return AuthResponse.of(token, UserSummary.from(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (Exception e) {
            // Generic failure: do not reveal whether the email or the password was wrong.
            throw new InvalidCredentialsException();
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);
        String token = jwtService.generateToken(user.getEmail());
        return AuthResponse.of(token, UserSummary.from(user));
    }

    @Transactional(readOnly = true)
    public UserSummary currentUser(String email) {
        return userRepository.findByEmail(email)
                .map(UserSummary::from)
                .orElseThrow(InvalidCredentialsException::new);
    }

    public static class EmailAlreadyUsedException extends RuntimeException {
        public EmailAlreadyUsedException() {
            super("Email is already registered");
        }
    }

    public static class InvalidCredentialsException extends BadCredentialsException {
        public InvalidCredentialsException() {
            super("Invalid email or password");
        }
    }
}
