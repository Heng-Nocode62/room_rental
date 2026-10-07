package com.heng.roomrental.translation.repository;

import com.heng.roomrental.translation.entity.Language;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LanguageRepository extends JpaRepository<Language, Long>, JpaSpecificationExecutor<Language> {
    Optional<Language> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
    List<Language> findAllByActiveTrueOrderByCodeAsc();

    @Query("select count(t) from Translation t where t.language.id = :languageId")
    long countTranslations(@Param("languageId") Long languageId);
}
