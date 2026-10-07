package com.heng.roomrental.reservation.controller;

import com.heng.roomrental.reservation.dto.ReservationResponse;
import com.heng.roomrental.reservation.service.ReservationStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationStatusController {

    private final ReservationStatusService
            reservationStatusService;


    @PostMapping("/{id}/confirm")
    public ReservationResponse confirm(
            @PathVariable("id")
            Long reservationId
    ) {

        return reservationStatusService.confirm(
                reservationId
        );
    }


    @PostMapping("/{id}/cancel")
    public ReservationResponse cancel(
            @PathVariable("id")
            Long reservationId
    ) {

        return reservationStatusService.cancel(
                reservationId
        );
    }

    @PostMapping("/{id}/check-in")
    public ReservationResponse checkIn(
            @PathVariable("id")
            Long reservationId
    ) {

        return reservationStatusService.checkIn(
                reservationId
        );
    }


    @PostMapping("/{id}/check-out")
    public ReservationResponse checkOut(
            @PathVariable("id")
            Long reservationId
    ) {

        return reservationStatusService.checkOut(
                reservationId
        );
    }
}