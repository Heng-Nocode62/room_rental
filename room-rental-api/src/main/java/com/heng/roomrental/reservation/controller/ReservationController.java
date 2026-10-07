package com.heng.roomrental.reservation.controller;

import com.heng.roomrental.common.dto.PageResponse;
import com.heng.roomrental.reservation.dto.CreateReservationRequest;
import com.heng.roomrental.reservation.dto.ReservationResponse;
import com.heng.roomrental.reservation.dto.ReservationSearchRequest;
import com.heng.roomrental.reservation.service.ReservationService;
import com.heng.roomrental.security.CurrentUserService;
import com.heng.roomrental.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final CurrentUserService currentUserService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('RESERVATION_CREATE')")
    public ReservationResponse create(
            @Valid
            @RequestBody
            CreateReservationRequest request,

            Authentication authentication
    ) {

        User currentUser =
                currentUserService.getCurrentUser(
                        authentication
                );

        return reservationService.create(
                request,
                currentUser
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('RESERVATION_VIEW')")
    public ReservationResponse getById(
            @PathVariable Long id
    ) {

        return reservationService.getById(id);
    }
    @GetMapping("/user/{id}")
    @PreAuthorize("hasAuthority('RESERVATION_VIEW')")
    public List<ReservationResponse> getByUserId(
            @PathVariable Long id
    ) {

        return reservationService.getByUserId(id);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('RESERVATION_VIEW')")
    public PageResponse<ReservationResponse> search(
            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            Long roomId,

            @RequestParam(required = false)
            Long locationId,

            @RequestParam(required = false)
            String status,

            @RequestParam(required = false)
            Short pricingUnitId,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate toDate,

            @PageableDefault(
                    size = 20,
                    sort = "startAt",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable
    ) {

        ReservationSearchRequest request =
                new ReservationSearchRequest(
                        keyword,
                        roomId,
                        locationId,
                        status,
                        pricingUnitId,
                        date,
                        fromDate,
                        toDate
                );

        return PageResponse.from(
                reservationService.search(
                        request,
                        pageable
                )
        );
    }
}