package com.heng.roomrental.permission.repository;

import com.heng.roomrental.permission.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ModuleRepository extends JpaRepository<Module, Long> {

    Optional<Module> findByName(String name);
    List<Module> findAllByOrderByIdAsc();

    boolean existsByName(String name);
}
