package com.hieu.profile_service.repository;

import com.hieu.profile_service.entity.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProfileRepository extends MongoRepository<UserProfile, String> {

    Page<UserProfile> findAll(Pageable pageable);

    Optional<UserProfile> findByUserId(String s);

    List<UserProfile> findAllByUserIdIn(List<String> userIds);

    void deleteByUserId(String userId);
}
