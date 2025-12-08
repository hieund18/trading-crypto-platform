package com.hieu.file_service.validator;

import java.util.List;

import com.hieu.file_service.constant.FileType;
import com.hieu.file_service.exception.AppException;
import com.hieu.file_service.exception.ErrorCode;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileValidator {
    public void validateFile(MultipartFile file, FileType fileType) {
        String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        List<String> dangerousExtensions = List.of("exe", "bat", "js", "php", "html", "sh");

        if (fileExtension == null || dangerousExtensions.contains(fileExtension))
            throw new AppException(ErrorCode.UNSUPPORTED_FILE_TYPE);

        String contentType = file.getContentType();

        if (file.isEmpty() || contentType == null) throw new AppException(ErrorCode.UNSUPPORTED_FILE_TYPE);

        if (file.getSize() > fileType.getMaxSize()) throw new AppException(ErrorCode.FILE_TOO_LARGE);

        if (fileType.getContentType().equals("image") && !contentType.startsWith("image/"))
            throw new AppException(ErrorCode.UNSUPPORTED_FILE_TYPE);

        List<String> allowedTypes = List.of(
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "text/plain");

        if (fileType.getContentType().equals("document") && !allowedTypes.contains(contentType))
            throw new AppException(ErrorCode.UNSUPPORTED_FILE_TYPE);
    }
}
