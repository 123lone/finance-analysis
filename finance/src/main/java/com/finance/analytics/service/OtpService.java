package com.finance.analytics.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final StringRedisTemplate redisTemplate;
    private static final String OTP_PREFIX = "OTP:";
    private static final long OTP_EXPIRATION_MINUTES = 5;

    public String generateAndStoreOtp(String email) {
        SecureRandom random = new SecureRandom();
        int otpValue = 100000 + random.nextInt(900000); // 6-digit OTP
        String otp = String.valueOf(otpValue);
        
        redisTemplate.opsForValue().set(OTP_PREFIX + email, otp, OTP_EXPIRATION_MINUTES, TimeUnit.MINUTES);
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        String storedOtp = redisTemplate.opsForValue().get(OTP_PREFIX + email);
        if (storedOtp != null && storedOtp.equals(otp)) {
            // OTP is correct, invalidate it immediately
            redisTemplate.delete(OTP_PREFIX + email);
            return true;
        }
        return false;
    }
}
