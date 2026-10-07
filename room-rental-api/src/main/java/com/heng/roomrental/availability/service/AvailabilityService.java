package com.heng.roomrental.availability.service;

import com.heng.roomrental.availability.dto.DayAvailabilityOverviewResponse;
import com.heng.roomrental.availability.dto.DayAvailabilityResponse;
import com.heng.roomrental.availability.dto.MonthlyAvailabilityResponse;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public interface AvailabilityService {

    DayAvailabilityResponse getDayAvailability(
            Long roomId,
            LocalDate date
    );
    DayAvailabilityOverviewResponse getDayAvailabilityOverview(
            LocalDate date,
            Long roomTypeId,
            Long locationId
    );
    MonthlyAvailabilityResponse getMonthAvailability(
            Long roomId,
            int year,
            int month
    );
}