package org.example.user;

import jakarta.validation.Valid;
import org.example.user.dto.ProfileResponse;
import org.example.user.dto.UpdateProfileRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ProfileResponse get(Authentication auth) {
        return userService.getProfile(auth.getName());
    }

    @PutMapping
    public ProfileResponse update(Authentication auth, @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(auth.getName(), request);
    }
}
