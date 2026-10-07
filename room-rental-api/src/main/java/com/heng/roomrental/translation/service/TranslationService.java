package com.heng.roomrental.translation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.heng.roomrental.translation.dto.*;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface TranslationService {
    PageResponse<TranslationResponse> search(Long languageId, String keyword, Pageable pageable);
    TranslationResponse upsert(Long languageId, TranslationUpsertRequest request);
    void upsertGlobal(GlobalTranslationRequest request);
    void deleteById(Long id);
    void deleteByKey(String key);
    TranslationResponse toggle(Long id);

    PublicTranslationResponse getPublicTranslations(String languageCode);
    Map<String, PublicTranslationResponse> getAllPublicTranslations();
    Map<String, Object> getTranslationVersion(String languageCode);

    byte[] exportTranslations(Long[] languageIds);
    ImportResult importTranslations(byte[] bytes);

    record ValueWithLanguage(String languageCode, JsonNode value) {}
}
