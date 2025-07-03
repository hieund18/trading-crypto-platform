package com.hieu.file_service.repository;

import com.hieu.file_service.entity.FileManagement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FileManagementRepository extends MongoRepository<FileManagement, String> {

    Optional<FileManagement> findByPath(String path);

    Optional<FileManagement> findByIdAndAccessLevel(String id, String accessLevel);
}
