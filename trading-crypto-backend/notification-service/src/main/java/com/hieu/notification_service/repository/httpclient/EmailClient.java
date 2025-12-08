package com.hieu.notification_service.repository.httpclient;

import com.hieu.notification_service.dto.ApiResponse;
import com.hieu.notification_service.dto.request.EmailRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "email-client", url = "${notification.email.sendgrid.url}")
public interface EmailClient {
    @PostMapping(value = "/v3/mail/send", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Void> sendEmail(
            @RequestHeader("Authorization") String authorization, @RequestBody EmailRequest request);
}
