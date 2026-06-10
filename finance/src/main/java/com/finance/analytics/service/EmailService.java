package com.finance.analytics.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Your Password Reset OTP");
            message.setText("Your One-Time Password for resetting your account is: " + otp + "\n\nThis OTP is valid for 5 minutes. Do not share this code with anyone.");
            mailSender.send(message);
            log.info("OTP Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", to, e);
            throw new RuntimeException("Failed to send email. Please check your SMTP configuration in application.properties.");
        }
    }
}
