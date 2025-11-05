package com.hieu.notification_service.service;

import com.hieu.common.dto.NotificationEvent;
import com.hieu.notification_service.dto.request.SendNotificationRequest;
import com.hieu.notification_service.exception.AppException;
import com.hieu.notification_service.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationService {
    TemplateService templateService;
    Map<String, NotificationChannel> channels;

    public void send(NotificationEvent notificationEvent) {
        SendNotificationRequest request = buildSendNotificationRequest(notificationEvent);

        NotificationChannel channel = channels.get(notificationEvent.getChannel());

        if (channel == null)
            throw new AppException(ErrorCode.INVALID_CHANNEL);

        channel.send(request);
        log.info("Send email success");
    }

    private SendNotificationRequest buildSendNotificationRequest(NotificationEvent notificationEvent) {
        String content = templateService.render(notificationEvent.getTemplateCode(), notificationEvent.getParam());

        String subject = switch (notificationEvent.getTemplateCode()) {
            case "email-verification" -> "Verify your email";
            case "forgot-password" -> "Reset your password";
            case "two-factor-auth" -> "Verify your identity";
            case "transaction" -> "Transaction code";
            default -> "Verify";
        };

        return SendNotificationRequest.builder()
                .recipient(notificationEvent.getRecipient())
                .content(content)
                .subject(subject)
                .build();
    }
}
