package com.hieu.file_service.service;

import java.io.IOException;
import java.time.Duration;
import java.util.Objects;
import java.util.UUID;

import com.hieu.file_service.constant.AccessScope;
import com.hieu.file_service.constant.FileType;
import com.hieu.file_service.dto.FileInfo;
import com.hieu.file_service.entity.FileManagement;
import com.hieu.file_service.exception.AppException;
import com.hieu.file_service.exception.ErrorCode;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AwsS3Service {
    S3Client s3Client;
    S3Presigner s3Presigner;
    ImageProcessorService imageProcessorService;

    @NonFinal
    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @NonFinal
    @Value("${cloud.aws.s3.public-dir}")
    private String publicDir;

    @NonFinal
    @Value("${cloud.aws.s3.private-dir}")
    private String privateDir;

    @CircuitBreaker(name = "awsS3Service", fallbackMethod = "fallBackUploadFile")
    @Retry(name = "awsS3Service")
    public FileInfo uploadFile(MultipartFile file, FileType fileType, AccessScope accessScope) throws IOException {
        log.info("Uploading to s3...");
        String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());

        String fileName =
                Objects.isNull(fileExtension) ? UUID.randomUUID().toString() : UUID.randomUUID() + "." + fileExtension;

        String accessLevel = accessScope == AccessScope.PUBLIC ? publicDir : privateDir;
        String key = accessLevel + fileType.getFolder() + fileName;

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        var data = file.getContentType().startsWith("image/")
                ? imageProcessorService.resize(file, fileType)
                : file.getBytes();

        s3Client.putObject(request, RequestBody.fromBytes(data));

        String url = s3Client.utilities()
                .getUrl(GetUrlRequest.builder().bucket(bucketName).key(key).build())
                .toString();

        return FileInfo.builder()
                .name(fileName)
                .contentType(file.getContentType())
                .size(file.getSize())
                .md5Checksum(DigestUtils.md5DigestAsHex(file.getInputStream()))
                .path(key)
                .url(url)
                .build();
    }

    @CircuitBreaker(name = "awsS3Service", fallbackMethod = "fallBackGetUrl")
    @Retry(name = "awsS3Service")
    public String getPresignedUrl(FileManagement fileManagement) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(fileManagement.getPath())
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .getObjectRequest(getObjectRequest)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    @CircuitBreaker(name = "awsS3Service", fallbackMethod = "fallBackGetUrl")
    @Retry(name = "awsS3Service")
    public String getUrl(FileManagement fileManagement) {
        GetUrlRequest getUrlRequest = GetUrlRequest.builder()
                .bucket(bucketName)
                .key(fileManagement.getPath())
                .build();

        return s3Client.utilities().getUrl(getUrlRequest).toString();
    }

    @CircuitBreaker(name = "awsS3Service", fallbackMethod = "fallBackCopyFile")
    @Retry(name = "awsS3Service")
    public FileInfo copyFile(FileManagement fileManagement, String newLevel) {

        String newFolder = newLevel.equals(AccessScope.PUBLIC.name()) ? publicDir : privateDir;
        String oldFolder = fileManagement.getAccessLevel().toLowerCase() + "/";
        //        String newKey = folder + fileManagement.getId();
        String newKey = fileManagement.getPath().replace(oldFolder, newFolder);

        CopyObjectRequest copyObjectRequest = CopyObjectRequest.builder()
                .sourceBucket(bucketName)
                .sourceKey(fileManagement.getPath())
                .destinationBucket(bucketName)
                .destinationKey(newKey)
                .build();

        s3Client.copyObject(copyObjectRequest);

        String url = s3Client.utilities()
                .getUrl(GetUrlRequest.builder().bucket(bucketName).key(newKey).build())
                .toString();

        return FileInfo.builder().path(newKey).url(url).build();
    }

    @CircuitBreaker(name = "awsS3Service", fallbackMethod = "fallBackDeleteFile")
    @Retry(name = "awsS3Service")
    public void deleteFile(FileManagement fileManagement) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(fileManagement.getPath())
                .build();

        s3Client.deleteObject(deleteObjectRequest);
    }

    public FileInfo fallBackUploadFile(MultipartFile file, FileType fileType, AccessScope accessScope, Throwable ex) {
        log.info("Fallback: S3 service exception", ex);
        throw new AppException(ErrorCode.CANNOT_UPLOAD_FILE);
    }

    public String fallBackGetUrl(FileManagement fileManagement, Throwable ex) {
        log.info("Fallback: S3 service exception", ex);
        throw new AppException(ErrorCode.CANNOT_GET_URL);
    }

    public FileInfo fallBackCopyFile(FileManagement fileManagement, String newLevel, Throwable ex) {
        log.info("Fallback: S3 service exception", ex);
        throw new AppException(ErrorCode.CANNOT_UPDATE_ACCESS_LEVEL);
    }

    public void fallBackDeleteFile(FileManagement fileManagement, Throwable ex) {
        log.info("Fallback: S3 service exception", ex);
        throw new AppException(ErrorCode.CANNOT_DELETE_FILE);
    }
}
