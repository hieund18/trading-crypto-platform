package com.hieu.file_service.constant;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum FileType {
    AVATAR("image", "avatars/",300, 5 * 1024 * 1024),
    POST_IMAGE("image", "posts/",1024, 5 * 1024 * 1024),
    DOCUMENT("document", "documents/",0, 10 * 1024 * 1024),

    ;

    FileType(String contentType, String folder, int maxResize, long maxSize) {
        this.contentType = contentType;
        this.folder = folder;
        this.maxResize = maxResize;
        this.maxSize = maxSize;
    }

    String contentType;
    String folder;
    int maxResize;
    long maxSize;
}
