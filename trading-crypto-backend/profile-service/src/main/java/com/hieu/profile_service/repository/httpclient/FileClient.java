package com.hieu.profile_service.repository.httpclient;

import com.hieu.profile_service.configuration.AuthenticationRequestInterceptor;
import com.hieu.profile_service.configuration.CustomFeignErrorDecoder;
import com.hieu.profile_service.constant.AccessScope;
import com.hieu.profile_service.constant.FileType;
import com.hieu.profile_service.dto.ApiResponse;
import com.hieu.profile_service.dto.response.FileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@FeignClient(
        name = "file-service",
        url = "${app.services.file}",
        configuration = {AuthenticationRequestInterceptor.class, CustomFeignErrorDecoder.class})
public interface FileClient {
    @PostMapping(value = "/media/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<FileResponse> uploadMediaAWS(
            @RequestPart("file") MultipartFile file,
            @RequestParam("type") FileType fileType,
            @RequestParam("accessLevel") AccessScope accessScope);

    @DeleteMapping("/media")
    ApiResponse<Void> deleteFileAWS(@RequestParam("path") String path);
}
