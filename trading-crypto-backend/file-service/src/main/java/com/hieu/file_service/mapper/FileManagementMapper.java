package com.hieu.file_service.mapper;

import com.hieu.file_service.dto.FileInfo;
import com.hieu.file_service.entity.FileManagement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FileManagementMapper {
    @Mapping(source = "name", target = "id")
    FileManagement toFileManagement(FileInfo fileInfo);
}
