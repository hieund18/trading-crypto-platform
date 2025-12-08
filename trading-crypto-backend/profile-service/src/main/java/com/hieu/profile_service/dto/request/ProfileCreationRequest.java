package com.hieu.profile_service.dto.request;

import java.time.LocalDate;

import com.hieu.profile_service.validator.DobConstraint;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileCreationRequest {
    String userId;

    //    @NotBlank(message = "FULL_NAME_IS_REQUIRED")
    String fullName;

    //    @NotNull(message = "DOB_IS_REQUIRED")
    @DobConstraint(min = 18, message = "INVALID_DOB")
    LocalDate dob;

    String address;
}
