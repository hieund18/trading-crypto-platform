package com.hieu.coin_service.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;

import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PageResponse<T> {
    int currentPage;
    int sizePage;
    int totalPages;
    long totalElements;

    @Builder.Default
    List<T> content = Collections.emptyList();

    public static <T> PageResponse<T> fromPage(Page<T> page) {
        return new PageResponse<>(page.getNumber() + 1,
                page.getSize(),
                page.getTotalPages(),
                page.getTotalElements(),
                page.getContent());
    }
}
