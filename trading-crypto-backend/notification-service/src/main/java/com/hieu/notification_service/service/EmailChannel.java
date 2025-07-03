package com.hieu.notification_service.service;

import com.hieu.notification_service.constant.PredefinedChannel;
import com.hieu.notification_service.dto.request.Recipient;
import com.hieu.notification_service.dto.request.SendEmailRequest;
import com.hieu.notification_service.dto.request.SendNotificationRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

@Component(PredefinedChannel.EMAIL)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailChannel implements NotificationChannel {
    EmailService emailService;

    @Override
    public void send(SendNotificationRequest request) {
        SendEmailRequest sendEmailRequest = SendEmailRequest.builder()
                .value(request.getContent())
                .subject(request.getSubject())
                .to(Recipient.builder()
                        .email(request.getRecipient())
                        .build())
                .build();

        emailService.sendEmail(sendEmailRequest);
    }
}
