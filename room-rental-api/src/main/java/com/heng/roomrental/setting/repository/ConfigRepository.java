package com.heng.roomrental.setting.repository;

import com.heng.roomrental.setting.entity.AppConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface ConfigRepository extends JpaRepository<AppConfig, Long> {

    Optional<AppConfig> findByKey(String key);

    boolean existsByKey(String key);

    List<AppConfig> findByKeyIn(Collection<String> keys);
}
