package com.heng.roomrental.payment.controller;

import com.heng.roomrental.payment.dto.ReservationQrResponse;
import com.heng.roomrental.payment.service.ReservationQrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationQrController {

    private final ReservationQrService reservationQrService;

    @PostMapping(
            value = "/{reservationId}/qr",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    @PreAuthorize("hasAuthority('RESERVATION_CREATE')")
    public ReservationQrResponse generateQr(
            @PathVariable Long reservationId
    ) {
        return reservationQrService.generateForReservation(reservationId);
    }
}