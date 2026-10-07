package com.heng.roomrental.pricing.repository;

import com.heng.roomrental.pricing.entity.PricingUnit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PricingUnitRepository
        extends JpaRepository<PricingUnit, Short> {

    Optional<PricingUnit> findByCode(String code);

    boolean existsByCode(String code);
}