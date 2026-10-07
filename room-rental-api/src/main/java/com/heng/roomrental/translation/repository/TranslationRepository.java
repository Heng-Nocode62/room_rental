package com.heng.roomrental.translation.repository;

import com.heng.roomrental.translation.entity.Translation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface TranslationRepository extends JpaRepository<Translation, Long>, JpaSpecificationExecutor<Translation> {
    Optional<Translation> findByLanguageIdAndKey(Long languageId, String key);
    List<Translation> findAllByLanguageIdAndActiveTrueOrderByKeyAsc(Long languageId);
    List<Translation> findAllByLanguageIdOrderByKeyAsc(Long languageId);
    List<Translation> findAllByKey(String key);
    List<Translation> findAllByKeyAndActiveTrue(String key);
    long deleteAllByLanguageId(Long languageId);
}
