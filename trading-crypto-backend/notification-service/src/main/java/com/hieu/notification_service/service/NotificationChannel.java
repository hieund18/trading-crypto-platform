package com.hieu.notification_service.service;

import com.hieu.notification_service.dto.request.SendNotificationRequest;

public interface NotificationChannel {
    void send(SendNotificationRequest request);
}
