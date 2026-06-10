package com.finance.analytics.controller;

import com.finance.analytics.dto.LoginResponse;
import com.finance.analytics.dto.UserProfileRequest;
import com.finance.analytics.entity.User;
import com.finance.analytics.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/profile")
    public ResponseEntity<LoginResponse> updateProfile(
            @RequestBody UserProfileRequest request,
            @AuthenticationPrincipal User user) {
        
        User updatedUser = userService.updateProfile(user.getEmail(), request);
        
        // Return updated info (without token, as JWT still valid for email)
        // Or client can just update local context
        return ResponseEntity.ok(new LoginResponse(
                null,
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getRole()
        ));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal User user) {
        userService.deleteAccount(user.getEmail());
        return ResponseEntity.noContent().build();
    }
}
