package com.hieu.file_service.service;

import com.hieu.file_service.constant.FileType;
import com.hieu.file_service.constant.AccessScope;
import com.hieu.file_service.dto.FileInfo;
import com.hieu.file_service.dto.response.FileData;
import com.hieu.file_service.dto.response.FileResponse;
import com.hieu.file_service.entity.FileManagement;
import com.hieu.file_service.exception.AppException;
import com.hieu.file_service.exception.ErrorCode;
import com.hieu.file_service.mapper.FileManagementMapper;
import com.hieu.file_service.repository.FileManagementRepository;
import com.hieu.file_service.repository.FileRepository;
import com.hieu.file_service.validator.FileValidator;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FileService {
    FileRepository fileRepository;
    FileManagementRepository fileManagementRepository;

    AwsS3Service awsS3Service;

    FileManagementMapper fileManagementMapper;

    FileValidator fileValidator;

    public FileResponse uploadFile(MultipartFile file) throws IOException {
        var fileInfo = fileRepository.store(file);

        var fileManagement = fileManagementMapper.toFileManagement(fileInfo);

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        fileManagement.setOwnerId(userId);

        fileManagementRepository.save(fileManagement);

        return FileResponse.builder()
                .originalFileName(file.getOriginalFilename())
                .path(fileInfo.getPath())
                .url(fileInfo.getUrl())
                .build();
    }

    public FileData downloadFile(String fileName) throws IOException {
        FileManagement fileManagement = fileManagementRepository.findById(fileName)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        var resource = fileRepository.read(fileManagement);

        return new FileData(resource, fileManagement.getContentType());
    }

    public FileResponse uploadFileAWS(MultipartFile file, FileType type, AccessScope accessScope) {
        fileValidator.validateFile(file, type);

        FileInfo fileInfo;
        try {
            fileInfo = awsS3Service.uploadFile(file, type, accessScope);
        } catch (AppException | IOException exception) {
            log.info("Exception", exception);
            throw new AppException(ErrorCode.CANNOT_UPLOAD_FILE);
        }

        FileManagement fileManagement = fileManagementMapper.toFileManagement(fileInfo);

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        fileManagement.setOwnerId(userId);

        String accessLevel = accessScope.name();
        fileManagement.setAccessLevel(accessLevel);

        fileManagementRepository.save(fileManagement);

        return FileResponse.builder()
                .originalFileName(file.getOriginalFilename())
                .path(fileInfo.getPath())
                .url(fileInfo.getUrl())
                .build();
    }

    public FileResponse getUrlAWS(String key) {
        FileManagement fileManagement = fileManagementRepository.findByPath(key)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        String accessLevel = fileManagement.getAccessLevel();

        if (accessLevel.equals(AccessScope.PRIVATE.name()) && !fileManagement.getOwnerId().equals(userId))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        String url = switch (accessLevel) {
            case "PUBLIC" -> awsS3Service.getUrl(fileManagement);
            default -> awsS3Service.getPresignedUrl(fileManagement);
        };

        return FileResponse.builder()
                .url(url)
                .build();
    }

    public void updateAccessLevelAWS(String fileName, String accessLevel) {
        try {
            AccessScope.valueOf(accessLevel);
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.INVALID_ACCESS_LEVEL);
        }

        FileManagement fileManagement = fileManagementRepository.findById(fileName)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        var userId = authentication.getName();

        if (!userId.equals(fileManagement.getOwnerId()))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        if (fileManagement.getAccessLevel().equals(accessLevel))
            return;

        var fileInfo = awsS3Service.copyFile(fileManagement, accessLevel);

        awsS3Service.deleteFile(fileManagement);

        fileManagement.setAccessLevel(accessLevel);
        fileManagement.setPath(fileInfo.getPath());
        fileManagementRepository.save(fileManagement);
    }

    public void deleteFileAWS(String path) {
        FileManagement fileManagement = fileManagementRepository.findByPath(path).orElse(null);

        if (fileManagement != null) {
            awsS3Service.deleteFile(fileManagement);

            fileManagementRepository.delete(fileManagement);
        }
    }
}
