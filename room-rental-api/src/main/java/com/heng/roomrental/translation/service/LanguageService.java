package com.heng.roomrental.translation.service;

import com.heng.roomrental.translation.dto.*;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LanguageService {
    PageResponse<LanguageResponse> search(String keyword, Boolean active, Pageable pageable);
    List<LanguageResponse> activeLanguages();
    LanguageResponse getById(Long id);
    LanguageResponse create(LanguageCreateRequest request);
    LanguageResponse update(Long id, LanguageUpdateRequest request);
    LanguageResponse toggle(Long id);
    void delete(Long id);
}
