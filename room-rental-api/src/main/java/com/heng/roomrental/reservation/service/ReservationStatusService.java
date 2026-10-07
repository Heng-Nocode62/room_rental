package com.heng.roomrental.reservation.service;

import com.heng.roomrental.reservation.dto.ReservationResponse;

public interface ReservationStatusService {

    ReservationResponse confirm(Long reservationId);

    ReservationResponse cancel(Long reservationId);

    ReservationResponse checkIn(Long reservationId);

    ReservationResponse checkOut(Long reservationId);
}