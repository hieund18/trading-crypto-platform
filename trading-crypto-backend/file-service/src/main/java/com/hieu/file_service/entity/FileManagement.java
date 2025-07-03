package com.hieu.file_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "file_management")
public class FileManagement {
    @MongoId
    String id;
    String ownerId;
    String contentType;
    long size;
    String md5Checksum;
    String path;
    String accessLevel;
}
