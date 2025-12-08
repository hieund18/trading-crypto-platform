package com.hieu.file_service.repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

import com.hieu.file_service.dto.FileInfo;
import com.hieu.file_service.entity.FileManagement;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Repository;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Repository
public class FileRepository {

    @Value("${app.file.storage-dir}")
    private String storageDir;

    @Value("${app.file.download-prefix}")
    private String urlPrefix;

    public FileInfo store(MultipartFile file) throws IOException {
        Path folder = Path.of(storageDir);

        if (!Files.exists(folder)) Files.createDirectories(folder);

        String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());

        String fileName =
                Objects.isNull(fileExtension) ? UUID.randomUUID().toString() : UUID.randomUUID() + "." + fileExtension;

        Path filePath = folder.resolve(fileName).normalize().toAbsolutePath();
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return FileInfo.builder()
                .name(fileName)
                .contentType(file.getContentType())
                .size(file.getSize())
                .md5Checksum(DigestUtils.md5DigestAsHex(file.getInputStream()))
                .path(filePath.toString())
                .url(urlPrefix + fileName)
                .build();
    }

    public Resource read(FileManagement fileManagement) throws IOException {
        var data = Files.readAllBytes(Path.of(fileManagement.getPath()));

        return new ByteArrayResource(data);
    }
}
