package com.hieu.file_service.controller;

import java.io.IOException;

import com.hieu.file_service.constant.AccessScope;
import com.hieu.file_service.constant.FileType;
import com.hieu.file_service.dto.ApiResponse;
import com.hieu.file_service.dto.response.FileResponse;
import com.hieu.file_service.service.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileController {
    FileService fileService;

    //    @PostMapping("/media/upload")
    //    ApiResponse<FileResponse> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
    //        return ApiResponse.<FileResponse>builder()
    //                .result(fileService.uploadFile(file))
    //                .build();
    //    }

    @GetMapping("/media/download/{fileName}")
    ResponseEntity<Resource> downloadFile(@PathVariable String fileName) throws IOException {
        var fileData = fileService.downloadFile(fileName);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, fileData.contentType())
                .body(fileData.resource());
    }

    @PostMapping("/media/upload")
    ApiResponse<FileResponse> uploadMediaAWS(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") FileType type,
            @RequestParam(value = "accessLevel", defaultValue = "PUBLIC") AccessScope accessScope)
            throws IOException {
        return ApiResponse.<FileResponse>builder()
                .result(fileService.uploadFileAWS(file, type, accessScope))
                .build();
    }

    //    @PostMapping("/media/upload/private")
    //    ApiResponse<FileResponse> uploadMediaPrivate(@RequestParam("file") MultipartFile file) throws IOException {
    //        return ApiResponse.<FileResponse>builder()
    //                .result(fileService.uploadFileAWS(file, false))
    //                .build();
    //    }

    @GetMapping("/media/url")
    ApiResponse<FileResponse> getUrlAWS(@RequestParam("path") String path) {
        return ApiResponse.<FileResponse>builder()
                .result(fileService.getUrlAWS(path))
                .build();
    }

    @PutMapping("/media/{fileName}/access-level")
    ApiResponse<Void> updateAccessLevelAWS(
            @PathVariable String fileName, @RequestParam("accessLevel") String accessLevel) {
        fileService.updateAccessLevelAWS(fileName, accessLevel);

        return ApiResponse.<Void>builder().build();
    }

    @DeleteMapping("/media")
    ApiResponse<Void> deleteFileAWS(@RequestParam("path") String path) {
        fileService.deleteFileAWS(path);

        return ApiResponse.<Void>builder().build();
    }
}
