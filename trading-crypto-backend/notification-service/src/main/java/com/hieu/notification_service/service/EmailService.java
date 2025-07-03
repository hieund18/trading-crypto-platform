package com.hieu.notification_service.service;

import com.hieu.notification_service.dto.request.*;
import com.hieu.notification_service.exception.AppException;
import com.hieu.notification_service.exception.ErrorCode;
import com.hieu.notification_service.repository.httpclient.EmailClient;
import feign.FeignException;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmailService {
    EmailClient emailClient;

    @NonFinal
    @Value("${notification.email.sendgrid.apikey}")
    private String apiKey;

    @NonFinal
    @Value("${notification.email.sender.email}")
    private String senderEmail;

    @NonFinal
    @Value("${notification.email.sender.name}")
    private String senderName;

    @Retry(name = "emailService")
    public void sendEmail(SendEmailRequest request) {
        Personalization personalization = Personalization.builder()
                .to(List.of(request.getTo()))
                .build();

        Sender sender = Sender.builder()
                .email(senderEmail)
                .name(senderName)
                .build();

        Content content = Content.builder()
                .type("text/html")
                .value(request.getValue())
                .build();

        EmailRequest emailRequest = EmailRequest.builder()
                .personalizations(List.of(personalization))
                .from(sender)
                .subject(request.getSubject())
                .content(List.of(content))
                .build();
        try {
            log.info("Calling send email");
            emailClient.sendEmail("Bearer " + apiKey, emailRequest);
        } catch (FeignException exception) {
            log.info("Error ", exception);
            throw new AppException(ErrorCode.CANNOT_SEND_EMAIL);
        }
    }
}
