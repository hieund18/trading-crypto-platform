package com.hieu.notification_service.controller;

import com.hieu.common.dto.NotificationEvent;
import com.hieu.notification_service.dto.request.Recipient;
import com.hieu.notification_service.dto.request.SendEmailRequest;
import com.hieu.notification_service.service.EmailService;
import com.hieu.notification_service.service.NotificationService;
import com.hieu.notification_service.service.TemplateService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationController {
    NotificationService notificationService;

    @KafkaListener(topics = "notification-delivery")
    public void listenNotificationDelivery(NotificationEvent message){
        log.info("Message: {}", message);

        notificationService.send(message);
    }
}
