package com.heng.roomrental.audit.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record AuditPageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {
    public static <T> AuditPageResponse<T> from(Page<T> page) {
        return new AuditPageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }
}
