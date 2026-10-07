package com.heng.roomrental.reservation.repository;

import com.heng.roomrental.reservation.entity.ReservationAmenity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationAmenityRepository
        extends JpaRepository<ReservationAmenity, Long> {
}