package com.heng.roomrental.translation.dto;

import org.springframework.data.domain.Page;
import java.util.List;

public record PageResponse<T>(List<T> data, Meta meta) {
    public record Meta(int currentPage, int perPage, long total, int lastPage) {}
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(page.getContent(), new Meta(
                page.getNumber() + 1, page.getSize(), page.getTotalElements(), page.getTotalPages()));
    }
}
