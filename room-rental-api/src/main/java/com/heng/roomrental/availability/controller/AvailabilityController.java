package com.heng.roomrental.availability.controller;

import com.heng.roomrental.availability.dto.DayAvailabilityOverviewResponse;
import com.heng.roomrental.availability.dto.DayAvailabilityResponse;
import com.heng.roomrental.availability.dto.MonthlyAvailabilityResponse;
import com.heng.roomrental.availability.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/day")
    @PreAuthorize("hasAuthority('AVAILABILITY_VIEW')")
    public DayAvailabilityResponse getDayAvailability(
            @RequestParam Long roomId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {

        return availabilityService.getDayAvailability(
                roomId,
                date
        );
    }
    @GetMapping("/day/overview")
    @PreAuthorize("hasAuthority('AVAILABILITY_VIEW')")
    public DayAvailabilityOverviewResponse getDayAvailabilityOverview(

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date,

            @RequestParam(
                    required = false
            )
            Long roomTypeId,

            @RequestParam(
                    required = false
            )
            Long locationId
    ) {

        return availabilityService
                .getDayAvailabilityOverview(
                        date,
                        roomTypeId,
                        locationId
                );
    }
    @GetMapping("/month")
    @PreAuthorize("hasAuthority('AVAILABILITY_VIEW')")
    public MonthlyAvailabilityResponse getMonthAvailability(
            @RequestParam Long roomId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return availabilityService.getMonthAvailability(
                roomId,
                year,
                month
        );
    }
}