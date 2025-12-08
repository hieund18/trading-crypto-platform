package com.hieu.notification_service.service;

import java.util.Map;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TemplateService {
    TemplateEngine templateEngine;

    public String render(String templateCode, Map<String, Object> param) {
        Context context = new Context();
        context.setVariables(param);
        return templateEngine.process(templateCode, context);
    }
}
