package com.finance.analytics.service;

import com.finance.analytics.dto.LoginRequest;
import com.finance.analytics.dto.LoginResponse;
import com.finance.analytics.dto.RegisterRequest;
import com.finance.analytics.dto.RegisterResponse;
import com.finance.analytics.entity.Role;
import com.finance.analytics.entity.User;
import com.finance.analytics.exception.UserAlreadyExistsException;
import com.finance.analytics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final EmailService emailService;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("A user with email " + request.email() + " already exists");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(); // Should always exist if authentication was successful

        String jwtToken = jwtService.generateToken(user);

        return new LoginResponse(
                jwtToken,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    public void forgotPassword(String email) {
        // 1. Verify user exists
        if (!userRepository.existsByEmail(email)) {
            // We still return void to prevent email enumeration attacks
            return;
        }

        // 2. Generate OTP
        String otp = otpService.generateAndStoreOtp(email);

        // 3. Send Email
        emailService.sendOtpEmail(email, otp);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        // 1. Verify OTP
        boolean isValid = otpService.verifyOtp(email, otp);
        if (!isValid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // 2. Find User
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Update Password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
