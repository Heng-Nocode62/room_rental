package com.heng.roomrental.reservation.repository;

import com.heng.roomrental.reservation.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReservationStatusRepository
        extends JpaRepository<ReservationStatus, Short> {

    Optional<ReservationStatus> findByCode(String code);
}