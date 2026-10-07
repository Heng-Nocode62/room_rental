package com.heng.roomrental.translation.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heng.roomrental.translation.dto.*;
import com.heng.roomrental.translation.entity.Language;
import com.heng.roomrental.translation.entity.Translation;
import com.heng.roomrental.translation.exception.NotFoundException;
import com.heng.roomrental.translation.repository.LanguageRepository;
import com.heng.roomrental.translation.repository.TranslationRepository;
import com.heng.roomrental.translation.service.TranslationService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class TranslationServiceImpl implements TranslationService {
    private final TranslationRepository translationRepository;
    private final LanguageRepository languageRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TranslationResponse> search(Long languageId, String keyword, Pageable pageable) {
        requireLanguage(languageId);
        String q = normalize(keyword);
        Specification<Translation> spec = (root, query, cb) -> {
            var p = cb.equal(root.get("language").get("id"), languageId);
            if (q != null) p = cb.and(p, cb.like(cb.lower(root.get("key")), "%" + q.toLowerCase(Locale.ROOT) + "%"));
            return p;
        };
        return PageResponse.from(translationRepository.findAll(spec, pageable).map(TranslationResponse::from));
    }

    @Override
    public TranslationResponse upsert(Long languageId, TranslationUpsertRequest request) {
        Language language = requireLanguage(languageId);
        String key = request.key().trim();
        if (key.isBlank()) throw new IllegalArgumentException("Translation key cannot be blank");

        Translation t = translationRepository.findByLanguageIdAndKey(languageId, key)
                .orElseGet(() -> Translation.builder().language(language).key(key).active(true).build());

        boolean changed = !Objects.equals(t.getValue(), request.value())
                || (request.active() != null && t.isActive() != request.active());
        t.setValue(objectMapper.valueToTree(request.value()));
        if (request.active() != null) t.setActive(request.active());
        Translation saved = translationRepository.save(t);
        return TranslationResponse.from(saved);
    }

    @Override
    public void upsertGlobal(GlobalTranslationRequest request) {
        String key = request.key().trim();
        if (key.isBlank()) throw new IllegalArgumentException("Translation key cannot be blank");
        for (Map.Entry<Long, String> e : request.values().entrySet()) {
            if (e.getValue() == null) continue;
            upsert(e.getKey(), new TranslationUpsertRequest(key,
                    objectMapper.getNodeFactory().textNode(e.getValue()), true));
        }
    }

    @Override
    public void deleteById(Long id) {
        Translation t = translationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Translation not found: " + id));
        Language language = t.getLanguage();
        translationRepository.delete(t);
    }

    @Override
    public void deleteByKey(String key) {
        String normalized = key == null ? "" : key.trim();
        if (normalized.isBlank()) return;
        List<Translation> translations = translationRepository.findAllByKey(normalized);
        if (translations.isEmpty()) return;
        Set<Language> languages = new HashSet<>();
        for (Translation t : translations) languages.add(t.getLanguage());
        translationRepository.deleteAll(translations);
    }

    @Override
    public TranslationResponse toggle(Long id) {
        Translation t = translationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Translation not found: " + id));
        t.setActive(!t.isActive());
        return TranslationResponse.from(t);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicTranslationResponse getPublicTranslations(String languageCode) {
        Language language = languageRepository.findByCodeIgnoreCase(normalizeCode(languageCode))
                .filter(Language::isActive)
                .orElseThrow(() -> new NotFoundException("Active language not found: " + languageCode));
        Map<String, Object> values = new LinkedHashMap<>();
        translationRepository.findAllByLanguageIdAndActiveTrueOrderByKeyAsc(language.getId())
                .forEach(t -> values.put(t.getKey(), toJavaValue(t.getValue())));
        return new PublicTranslationResponse(language.getCode(), language.getTitle(), language.getFlag(), values);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, PublicTranslationResponse> getAllPublicTranslations() {
        Map<String, PublicTranslationResponse> result = new LinkedHashMap<>();
        for (Language language : languageRepository.findAllByActiveTrueOrderByCodeAsc()) {
            result.put(language.getCode(), getPublicTranslations(language.getCode()));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getTranslationVersion(String languageCode) {
        Language language = languageRepository.findByCodeIgnoreCase(normalizeCode(languageCode))
                .filter(Language::isActive)
                .orElseThrow(() -> new NotFoundException("Active language not found: " + languageCode));
        return Map.of("language", language.getCode());
    }

    @Override
    public byte[] exportTranslations(Long[] languageIds) {
        if (languageIds != null) {
            languageIds = Arrays.stream(languageIds).filter(Objects::nonNull).distinct().toArray(Long[]::new);
        }
        List<Language> languages = languageIds == null || languageIds.length == 0
                ? languageRepository.findAllByActiveTrueOrderByCodeAsc()
                : languageRepository.findAllById(Arrays.asList(languageIds));
        if (languages.isEmpty()) throw new NotFoundException("No languages found");

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Translations");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("key");
            for (int i = 0; i < languages.size(); i++) header.createCell(i + 1).setCellValue(languages.get(i).getCode());

            Set<String> keys = new TreeSet<>();
            Map<Long, Map<String, String>> values = new HashMap<>();
            for (Language language : languages) {
                Map<String, String> map = new HashMap<>();
                translationRepository.findAllByLanguageIdOrderByKeyAsc(language.getId()).forEach(t -> {
                    map.put(t.getKey(), nodeToString(t.getValue()));
                    keys.add(t.getKey());
                });
                values.put(language.getId(), map);
            }
            int rowIndex = 1;
            for (String key : keys) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(key);
                for (int i = 0; i < languages.size(); i++) {
                    row.createCell(i + 1).setCellValue(values.get(languages.get(i).getId()).getOrDefault(key, ""));
                }
            }
            for (int i = 0; i <= languages.size(); i++) sheet.autoSizeColumn(i);
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to export translations", e);
        }
    }

    @Override
    public ImportResult importTranslations(byte[] bytes) {
        if (bytes == null || bytes.length == 0) throw new IllegalArgumentException("File is empty");
        int imported = 0, skipped = 0, rowsProcessed = 0, languagesMatched = 0;
        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            if (workbook.getNumberOfSheets() == 0) throw new IllegalArgumentException("Workbook has no sheets");
            Sheet sheet = workbook.getSheetAt(0);
            Row header = sheet.getRow(0);
            if (header == null) throw new IllegalArgumentException("Missing header row");
            DataFormatter formatter = new DataFormatter();
            int keyColumn = -1;
            for (int i = 0; i < header.getLastCellNum(); i++) {
                if ("key".equalsIgnoreCase(formatter.formatCellValue(header.getCell(i)).trim())) { keyColumn = i; break; }
            }
            if (keyColumn < 0) throw new IllegalArgumentException("Missing 'key' column");

            Map<Integer, Language> languages = new LinkedHashMap<>();
            for (int i = 0; i < header.getLastCellNum(); i++) {
                if (i == keyColumn) continue;
                String code = formatter.formatCellValue(header.getCell(i)).trim();
                if (code.isBlank()) continue;
                int finalI = i;
                languageRepository.findByCodeIgnoreCase(normalizeCode(code)).ifPresent(l -> languages.put(finalI, l));
            }
            languagesMatched = languages.size();
            if (languages.isEmpty()) throw new IllegalArgumentException("No matching language codes found in header");

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) { skipped++; continue; }
                String key = formatter.formatCellValue(row.getCell(keyColumn)).trim();
                if (key.isBlank()) { skipped++; continue; }
                rowsProcessed++;
                boolean rowImported = false;
                for (Map.Entry<Integer, Language> entry : languages.entrySet()) {
                    String value = formatter.formatCellValue(row.getCell(entry.getKey())).trim();
                    if (value.isBlank()) continue;
                    upsert(entry.getValue().getId(), new TranslationUpsertRequest(key,
                            objectMapper.getNodeFactory().textNode(value), true));
                    imported++;
                    rowImported = true;
                }
                if (!rowImported) skipped++;
            }
            return new ImportResult(imported, skipped, languagesMatched, rowsProcessed);
        } catch (IOException e) {
            throw new IllegalArgumentException("Could not read Excel file", e);
        }
    }

    private Language requireLanguage(Long id) {
        return languageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Language not found: " + id));
    }
    private String normalize(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private String normalizeCode(String value) { return value.trim().replace('_', '-').toLowerCase(Locale.ROOT); }
    private Object toJavaValue(JsonNode node) { return node == null ? null : objectMapper.convertValue(node, Object.class); }
    private String nodeToString(JsonNode node) {
        if (node == null || node.isNull()) return "";
        return node.isTextual() ? node.asText() : node.toString();
    }
}
