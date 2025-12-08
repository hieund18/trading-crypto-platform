package com.hieu.file_service.repository;

import java.util.Optional;

import com.hieu.file_service.entity.FileManagement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileManagementRepository extends MongoRepository<FileManagement, String> {

    Optional<FileManagement> findByPath(String path);

    Optional<FileManagement> findByIdAndAccessLevel(String id, String accessLevel);
}
