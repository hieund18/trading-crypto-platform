package com.hieu.profile_service.service;

import com.hieu.profile_service.constant.AccessScope;
import com.hieu.profile_service.constant.FileType;
import com.hieu.profile_service.dto.ApiResponse;
import com.hieu.profile_service.dto.response.FileResponse;
import com.hieu.profile_service.repository.httpclient.FileClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FileService {
    FileClient fileClient;

    @CircuitBreaker(name = "fileService")
    @Retry(name = "fileService")
    public ApiResponse<FileResponse> uploadMediaAWS(MultipartFile file, FileType fileType, AccessScope accessScope){
        log.info("Calling upload file");
        return fileClient.uploadMediaAWS(file, fileType, accessScope);
    }

    @Retry(name = "fileService")
    public ApiResponse<Void> deleteFileAWS(String path){
        log.info("Calling delete file");
        return fileClient.deleteFileAWS(path);
    }
}
