package com.hieu.profile_service.entity;

import java.time.LocalDate;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "user_profiles")
public class UserProfile {
    @MongoId
    String id;

    String userId;

    String fullName;

    LocalDate dob;
    String address;

    String avatarPath;
    String avatarUrl;
}
