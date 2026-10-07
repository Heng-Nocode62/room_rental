package com.heng.roomrental.translation.controller;

import com.heng.roomrental.translation.dto.*;
import com.heng.roomrental.translation.service.LanguageService;
import com.heng.roomrental.translation.service.TranslationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TranslationController {
    private final LanguageService languageService;
    private final TranslationService translationService;

    @GetMapping("/translate")
    public ResponseEntity<Map<String, Object>> getAllTranslations() {
        return ResponseEntity.ok(Map.of("data", translationService.getAllPublicTranslations()));
    }

    @GetMapping("/translate/{languageCode}")
    public ResponseEntity<PublicTranslationResponse> getTranslations(@PathVariable String languageCode) {
        return ResponseEntity.ok(translationService.getPublicTranslations(languageCode));
    }

    @GetMapping("/translate/{languageCode}/version")
    public ResponseEntity<Map<String, Object>> getTranslationVersion(@PathVariable String languageCode) {
        return ResponseEntity.ok(translationService.getTranslationVersion(languageCode));
    }

    @GetMapping("/language/active")
    public ResponseEntity<?> activeLanguages() {
        return ResponseEntity.ok(Map.of("data", languageService.activeLanguages()));
    }

    @GetMapping("/language")
    public ResponseEntity<PageResponse<LanguageResponse>> listLanguage(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int perPage,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String safeSort = switch (sortBy) {
            case "id", "code", "title", "createdAt", "updatedAt", "translationVersion" -> sortBy;
            default -> "createdAt";
        };
        Pageable pageable = PageRequest.of(Math.max(page, 1) - 1, Math.min(Math.max(perPage, 1), 100),
                Sort.by(direction, safeSort));
        return ResponseEntity.ok(languageService.search(keyword, isActive, pageable));
    }

    @GetMapping("/language/{language}")
    public ResponseEntity<LanguageResponse> getLanguage(@PathVariable Long language) {
        return ResponseEntity.ok(languageService.getById(language));
    }

    @PostMapping("/language")
    public ResponseEntity<LanguageResponse> createLanguage(@Valid @RequestBody LanguageCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(languageService.create(request));
    }

    @PutMapping("/language/{language}")
    public ResponseEntity<LanguageResponse> updateLanguage(@PathVariable Long language,
                                                             @Valid @RequestBody LanguageUpdateRequest request) {
        return ResponseEntity.ok(languageService.update(language, request));
    }

    @PatchMapping("/language/{language}/toggle")
    public ResponseEntity<LanguageResponse> toggleLanguage(@PathVariable Long language) {
        return ResponseEntity.ok(languageService.toggle(language));
    }

    @DeleteMapping("/language/{language}")
    public ResponseEntity<Void> deleteLanguage(@PathVariable Long language) {
        languageService.delete(language);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/language/{language}/translation")
    public ResponseEntity<PageResponse<TranslationResponse>> listTranslation(
            @PathVariable Long language,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int perPage) {
        Pageable pageable = PageRequest.of(Math.max(page, 1) - 1, Math.min(Math.max(perPage, 1), 500),
                Sort.by(Sort.Direction.ASC, "key"));
        return ResponseEntity.ok(translationService.search(language, keyword, pageable));
    }

    @PostMapping("/language/{language}/translation")
    public ResponseEntity<TranslationResponse> upsertTranslation(
            @PathVariable Long language,
            @Valid @RequestBody TranslationUpsertRequest request) {
        return ResponseEntity.ok(translationService.upsert(language, request));
    }

    @PatchMapping("/translation/{translation}/toggle")
    public ResponseEntity<TranslationResponse> toggleTranslation(@PathVariable Long translation) {
        return ResponseEntity.ok(translationService.toggle(translation));
    }

    @DeleteMapping("/translation/by-key")
    public ResponseEntity<Void> deleteTranslationByKey(@RequestParam String key) {
        translationService.deleteByKey(key);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/translation/{translation}")
    public ResponseEntity<Void> deleteTranslation(@PathVariable Long translation) {
        translationService.deleteById(translation);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/translation/global")
    public ResponseEntity<?> upsertGlobalTranslation(@Valid @RequestBody GlobalTranslationRequest request) {
        translationService.upsertGlobal(request);
        return ResponseEntity.ok(Map.of("message", "Translation saved successfully."));
    }

    @GetMapping("/translation/export")
    public ResponseEntity<byte[]> exportTranslations(@RequestParam(required = false) Long[] languages) {
        byte[] file = translationService.exportTranslations(languages);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"translations.xlsx\"")
                .body(file);
    }

    @PostMapping(value = "/translation/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importTranslations(@RequestPart("file") MultipartFile file) throws java.io.IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Import file is empty");
        }
        String name = file.getOriginalFilename();
        if (name == null || !name.toLowerCase(java.util.Locale.ROOT).endsWith(".xlsx")) {
            throw new IllegalArgumentException("Only .xlsx files are supported");
        }
        ImportResult result = translationService.importTranslations(file.getBytes());
        return ResponseEntity.ok(Map.of(
                "message", "Import completed.",
                "imported", result.imported(),
                "skipped", result.skipped(),
                "languagesMatched", result.languagesMatched(),
                "rowsProcessed", result.rowsProcessed()));
    }
}
