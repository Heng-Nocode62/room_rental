package com.heng.roomrental.translation.service.impl;

import com.heng.roomrental.translation.dto.*;
import com.heng.roomrental.translation.entity.Language;
import com.heng.roomrental.translation.exception.*;
import com.heng.roomrental.translation.repository.LanguageRepository;
import com.heng.roomrental.translation.repository.TranslationRepository;
import com.heng.roomrental.translation.service.LanguageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class LanguageServiceImpl implements LanguageService {
    private final LanguageRepository languageRepository;
    private final TranslationRepository translationRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<LanguageResponse> search(String keyword, Boolean active, Pageable pageable) {
        String q = normalize(keyword);
        Specification<Language> spec = (root, query, cb) -> {
            var p = cb.conjunction();
            if (q != null) {
                String like = "%" + q.toLowerCase(Locale.ROOT) + "%";
                p = cb.and(p, cb.or(
                        cb.like(cb.lower(root.get("code")), like),
                        cb.like(cb.lower(root.get("title")), like)));
            }
            if (active != null) p = cb.and(p, cb.equal(root.get("active"), active));
            return p;
        };
        return PageResponse.from(languageRepository.findAll(spec, pageable)
                .map(l -> LanguageResponse.from(l, languageRepository.countTranslations(l.getId()))));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LanguageResponse> activeLanguages() {
        return languageRepository.findAllByActiveTrueOrderByCodeAsc().stream()
                .map(l -> LanguageResponse.from(l, languageRepository.countTranslations(l.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LanguageResponse getById(Long id) {
        Language language = find(id);
        return LanguageResponse.from(language, languageRepository.countTranslations(id));
    }

    @Override
    public LanguageResponse create(LanguageCreateRequest r) {
        String code = normalizeCode(r.code());
        if (languageRepository.existsByCodeIgnoreCase(code))
            throw new ConflictException("Language code already exists: " + code);

        Language language = Language.builder()
                .code(code).title(r.title().trim()).flag(blankToNull(r.flag()))
                .active(r.active() == null || r.active()).build();
        return LanguageResponse.from(languageRepository.save(language), 0);
    }

    @Override
    public LanguageResponse update(Long id, LanguageUpdateRequest r) {
        Language language = find(id);
        String code = normalizeCode(r.code());
        String oldCode = language.getCode();
        String oldTitle = language.getTitle();
        String oldFlag = language.getFlag();
        boolean oldActive = language.isActive();
        languageRepository.findByCodeIgnoreCase(code)
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> { throw new ConflictException("Language code already exists: " + code); });

        language.setCode(code);
        language.setTitle(r.title().trim());
        if (r.flag() != null) language.setFlag(blankToNull(r.flag()));
        if (r.active() != null) language.setActive(r.active());

        return LanguageResponse.from(language, languageRepository.countTranslations(id));
    }

    @Override
    public LanguageResponse toggle(Long id) {
        Language language = find(id);
        language.setActive(!language.isActive());
        return LanguageResponse.from(language, languageRepository.countTranslations(id));
    }

    @Override
    public void delete(Long id) {
        Language language = find(id);
        // Explicitly remove child rows so this module does not depend on DB cascade settings.
        translationRepository.deleteAllByLanguageId(id);
        languageRepository.delete(language);
    }

    private Language find(Long id) {
        return languageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Language not found: " + id));
    }

    private String normalizeCode(String code) {
        return code.trim().replace('_', '-').toLowerCase(Locale.ROOT);
    }

    private String normalize(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
