package com.hieu.otp_service.util;

import java.security.SecureRandom;

import org.springframework.stereotype.Component;

@Component
public class OtpUtil {
    private static final SecureRandom random = new SecureRandom();

    public String generateOtpCode() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
