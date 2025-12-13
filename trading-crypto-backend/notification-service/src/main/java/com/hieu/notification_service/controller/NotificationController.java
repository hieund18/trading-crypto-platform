package com.hieu.notification_service.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hieu.common.dto.NotificationEvent;
import com.hieu.notification_service.service.NotificationService;
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
    public void listenNotificationDelivery(NotificationEvent message) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        log.info("RAW KAFKA MESSAGE = {}", mapper.writeValueAsString(message));

        notificationService.send(message);
    }
}
