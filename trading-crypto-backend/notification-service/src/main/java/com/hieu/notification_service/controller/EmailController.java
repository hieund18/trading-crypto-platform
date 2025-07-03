package com.hieu.notification_service.controller;

import com.hieu.notification_service.dto.ApiResponse;
import com.hieu.notification_service.dto.request.SendEmailRequest;
import com.hieu.notification_service.service.EmailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailController {
    EmailService emailService;

    @PostMapping("/email/send")
    ApiResponse<Void> sendEmail(@RequestBody SendEmailRequest request){
        emailService.sendEmail(request);

        return ApiResponse.<Void>builder().build();
    }
}
