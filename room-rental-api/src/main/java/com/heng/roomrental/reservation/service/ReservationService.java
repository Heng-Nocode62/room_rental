package com.heng.roomrental.reservation.service;

import com.heng.roomrental.reservation.dto.CreateReservationRequest;
import com.heng.roomrental.reservation.dto.ReservationResponse;
import com.heng.roomrental.reservation.dto.ReservationSearchRequest;
import com.heng.roomrental.reservation.entity.Reservation;
import com.heng.roomrental.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReservationService {

    ReservationResponse create(
            CreateReservationRequest request,
            User reservedBy
    );

    ReservationResponse getById(
            Long id
    );

    Reservation getEntityById(
            Long id
    );
    Page<ReservationResponse> search(
            ReservationSearchRequest request,
            Pageable pageable
    );

    ReservationResponse toResponse(
            Reservation reservation
    );

    void confirmAfterPayment(Reservation reservation);

    void cancelAfterPaymentFailure(Reservation reservation);

    List<ReservationResponse> getByUserId(Long id);
    List<ReservationResponse> getMyReservations();
}