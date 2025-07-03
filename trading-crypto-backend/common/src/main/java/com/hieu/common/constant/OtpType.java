//package com.hieu.common.constant;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

//@Getter
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//public enum OtpType {
//    EMAIL_VERIFICATION(5, 30, 5, 10),
//    PASSWORD_FORGOT(3, 10, 3, 3),
//    TWO_FACTOR_AUTH(3, 5, 3, 3),
//    TRANSACTION(3, 1, 3, 1);
//
//    ;
//
//    OtpType(int maxSendPerWindow, int rateLimitWindow, int maxVerifyAttempts, int otpTtl) {
//        this.maxSendPerWindow = maxSendPerWindow;
//        this.timeLimitWindow = rateLimitWindow;
//        this.maxVerifyAttempts = maxVerifyAttempts;
//        this.otpTtl = otpTtl;
//    }
//
//    int maxSendPerWindow;
//    int timeLimitWindow;
//    int maxVerifyAttempts;
//    int otpTtl;

//    public static OtpType toOtpType(String otpType){
//        OtpType type;
//        try{
//            type = OtpType.valueOf(otpType);
//        }catch (IllegalArgumentException exception){
//            throw new AppException(ErrorCode.INVALID_KEY);
//        }
//        return type;
//    }
//}
