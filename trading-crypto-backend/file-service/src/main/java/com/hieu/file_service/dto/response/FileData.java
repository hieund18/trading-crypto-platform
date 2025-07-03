package com.hieu.file_service.dto.response;

import org.springframework.core.io.Resource;

public record FileData(Resource resource, String contentType) {
}
