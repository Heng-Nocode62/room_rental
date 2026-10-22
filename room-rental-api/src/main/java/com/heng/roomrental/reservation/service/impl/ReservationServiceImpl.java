package com.heng.roomrental.reservation.service.impl;

import com.heng.roomrental.availability.service.AvailabilityValidationService;
import com.heng.roomrental.common.exception.InvalidOperationException;
import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.common.web.SortValidator;
import com.heng.roomrental.location.entity.LocationOperatingHours;
import com.heng.roomrental.location.repository.LocationOperatingHoursRepository;
import com.heng.roomrental.pricing.dto.PriceCalculationResult;
import com.heng.roomrental.pricing.service.PricingCalculationService;
import com.heng.roomrental.reservation.dto.CreateReservationRequest;
import com.heng.roomrental.reservation.dto.ReservationAmenityRequest;
import com.heng.roomrental.reservation.dto.ReservationResponse;
import com.heng.roomrental.reservation.dto.ReservationSearchRequest;
import com.heng.roomrental.reservation.entity.Reservation;
import com.heng.roomrental.reservation.entity.ReservationAmenity;
import com.heng.roomrental.reservation.entity.ReservationStatus;
import com.heng.roomrental.reservation.repository.ReservationRepository;
import com.heng.roomrental.reservation.repository.ReservationStatusRepository;
import com.heng.roomrental.reservation.service.ReservationService;
import com.heng.roomrental.reservation.specification.ReservationSpecifications;
import com.heng.roomrental.room.entity.Amenity;
import com.heng.roomrental.room.entity.Room;
import com.heng.roomrental.room.entity.RoomStatus;
import com.heng.roomrental.room.repository.AmenityRepository;
import com.heng.roomrental.room.service.RoomService;
import com.heng.roomrental.security.CurrentUserService;
import com.heng.roomrental.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservationStatusRepository reservationStatusRepository;
    private final RoomService roomService;
    private final AvailabilityValidationService availabilityValidationService;
    private final PricingCalculationService pricingCalculationService;
    private final LocationOperatingHoursRepository operatingHoursRepository;
    private final AmenityRepository amenityRepository;
    private final SortValidator sortValidator;
    private static final ZoneId SYSTEM_ZONE = ZoneId.of("Asia/Phnom_Penh");
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public ReservationResponse create(
            CreateReservationRequest request,
            User reservedBy
    ) {

        validateRequest(request);
        Room room = roomService.getEntityById(request.roomId());
        validateRoom(room);
        availabilityValidationService.validateAvailable(
                room.getId(),
                request.startAt(),
                request.endAt()
        );
        PriceCalculationResult price = pricingCalculationService.calculate(
                        room,
                        request.pricingUnitId(),
                        request.startAt(),
                        request.endAt()
                );
        ReservationStatus status = reservationStatusRepository
                        .findByCode("PENDING")
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Reservation status PENDING not found"
                                )
                        );

        Reservation reservation = new Reservation();

        BigDecimal amenitiesTotal = addAmenities(
                reservation,
                request.amenities()
        );

        reservation.setReferenceNo(generateReferenceNumber());
        reservation.setRoom(room);
        reservation.setReservedBy(reservedBy);
        reservation.setStatus(status);
        reservation.setStartAt(request.startAt());
        reservation.setEndAt(request.endAt());
        reservation.setPricingUnit(price.pricingUnit());
        reservation.setUnitPrice(price.unitPrice());
        reservation.setTotalAmount(price.totalAmount().add(amenitiesTotal));
        reservation.setCurrencyCode(price.currencyCode());
        reservation.setPurpose(request.purpose());
        reservation.setContactName(request.contactName());
        reservation.setContactPhone(request.contactPhone());
        reservation.setCompanyName(request.companyName());
        reservation.setNotes(request.notes());
        Reservation savedReservation = reservationRepository.save(reservation);

        return toResponse(savedReservation);
    }



    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getById(
            Long id
    ) {

        Reservation reservation = reservationRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Reservation not found: "
                                                + id
                                )
                        );

        return toResponse(reservation);
    }
    @Override
    public Reservation getEntityById(Long id) {
        return reservationRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Reservation not found: "
                                        + id
                        )
                );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> search(
            ReservationSearchRequest request,
            Pageable pageable
    ) {
        sortValidator.validate(
                pageable,
                Set.of(
                        "startAt",
                        "endAt",
                        "referenceNo",
                        "totalAmount",
                        "createdAt"
                )
        );

        List<Specification<Reservation>> specifications = Stream.of(

                ReservationSpecifications.keyword(
                        request.keyword()
                ),

                ReservationSpecifications.room(
                        request.roomId()
                ),

                ReservationSpecifications.location(
                        request.locationId()
                ),

                ReservationSpecifications.status(
                        request.status()
                ),

                ReservationSpecifications.pricingUnit(
                        request.pricingUnitId()
                ),

                buildDateSpecification(
                        request
                )
        ).filter(Objects::nonNull)
                .toList();
        Specification<Reservation> specification = Specification.allOf(specifications);

        return reservationRepository
                .findAll(
                        specification,
                        pageable
                )
                .map(this::toResponse);
    }


    private void validateRequest(
            CreateReservationRequest request
    ) {

        if (request.startAt() == null
                || request.endAt() == null) {

            throw new IllegalArgumentException(
                    "Start time and end time are required"
            );
        }
        if (request.startAt().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException(
                    "Start time must after now"
            );
        }

        if (!request.endAt()
                .isAfter(request.startAt())) {

            throw new IllegalArgumentException(
                    "End time must be after start time"
            );
        }
    }




    private void validateRoom(
            Room room
    ) {

        if (!room.getStatus().equals(RoomStatus.ACTIVE)) {

            throw new InvalidOperationException(
                    "ROOM_NOT_ACTIVE",
                    "Room "
                            + room.getRoomNumber()
                            + " is not active"
            );
        }
    }




    private void validateOperatingHours(
            Room room,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {


        ZoneId zone = ZoneId.of(
                        room.getLocation()
                                .getTimeZone());


        ZonedDateTime start = startAt.atZoneSameInstant(zone);

        ZonedDateTime end = endAt.atZoneSameInstant(zone);


        if (!start.toLocalDate().equals(end.toLocalDate())) {

            throw new InvalidOperationException(
                    "MULTI_DAY_RESERVATION_NOT_SUPPORTED",
                    "Reservation start and end "
                            + "must be on the same day"
            );
        }
        LocalDate date = start.toLocalDate();


        short dayOfWeek = (short) date
                        .getDayOfWeek()
                        .getValue();


        LocationOperatingHours operatingHours = operatingHoursRepository
                        .findByLocationIdAndDayOfWeek(
                                room.getLocation().getId(),
                                dayOfWeek
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Operating hours not configured "
                                                + "for "
                                                + date.getDayOfWeek()
                                ));


        // Location closed
        if (operatingHours.isClosed()) {
            throw new InvalidOperationException(
                    "LOCATION_CLOSED",
                    "Location is closed on "
                            + date.getDayOfWeek()
            );
        }

        // Starts before opening
        if (start.toLocalTime()
                .isBefore(operatingHours.getOpenTime())) {

            throw new InvalidOperationException(
                    "OUTSIDE_OPERATING_HOURS",
                    "Reservation starts before "
                            + "operating hours"
            );
        }

        // Ends after closing
        if (end.toLocalTime()
                .isAfter(operatingHours.getCloseTime())) {

            throw new InvalidOperationException(
                    "OUTSIDE_OPERATING_HOURS",
                    "Reservation ends after "
                            + "operating hours"
            );
        }
    }



    private String generateReferenceNumber() {

        String random = UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 8)
                        .toUpperCase();

        return "RES-" + random;
    }



    @Override
    public ReservationResponse toResponse(
            Reservation reservation
    ) {

        return new ReservationResponse(

                reservation.getId(),
                reservation.getReferenceNo(),
                reservation.getRoom().getId(),
                reservation.getRoom().getRoomNumber(),
                reservation.getRoom().getName(),


                // Reserved by
                reservation.getReservedBy().getId(),
                reservation.getReservedBy().getFirstName()
                        + " "
                        + reservation.getReservedBy().getLastName(),


                // Status
                reservation.getStatus().getCode(),

                // Time
                reservation.getStartAt(),
                reservation.getEndAt(),


                // Pricing
                reservation.getPricingUnit().getId(),
                reservation.getPricingUnit().getCode(),
                reservation.getUnitPrice(),
                reservation.getTotalAmount(),
                reservation.getCurrencyCode(),


                // Reservation information
                reservation.getPurpose(),
                reservation.getContactName(),
                reservation.getContactPhone(),
                reservation.getCompanyName(),
                reservation.getNotes()
        );
    }

    @Override
    public void confirmAfterPayment(Reservation reservation) {
        validateTransition(
                reservation,
                "PENDING",
                "CONFIRMED"
        );

        ReservationStatus confirmedStatus =
                getStatus("CONFIRMED");

        reservation.setStatus(
                confirmedStatus
        );
        reservation.setReservedBy(currentUserService.getCurrentUser());

        Reservation saved =
                reservationRepository.save(
                        reservation
                );
    }

    @Override
    public void cancelAfterPaymentFailure(Reservation reservation) {
        String currentStatus = reservation.getStatus().getCode();

        if (!currentStatus.equals("PENDING")
                && !currentStatus.equals("CONFIRMED")) {
            throw new InvalidOperationException(
                    "INVALID_RESERVATION_CANCELLATION",
                    "Reservation with status "
                            + currentStatus
                            + " cannot be cancelled."
            );
        }

        ReservationStatus cancelledStatus = getStatus("CANCELLED");

        reservation.setStatus(
                cancelledStatus
        );
        reservation.setCancelledBy(currentUserService.getCurrentUser());
        reservation.setCancelledAt(OffsetDateTime.now());
        List<ReservationAmenity> reservationAmenities = reservation.getAmenities();
        reservationAmenities.forEach(a -> {
            Amenity amenity = a.getAmenity();
            amenity.setStockQuantity(amenity.getStockQuantity() +a.getQuantity());
        });

        Reservation saved = reservationRepository.save(
                        reservation
                );
    }

    @Override
    public List<ReservationResponse> getByUserId(Long id) {
        List<Reservation> reservations = reservationRepository.findByReservedBy_Id(id);
        return reservations.stream().map(this::toResponse).toList();
    }

    @Override
    public List<ReservationResponse> getMyReservations() {
        User user = currentUserService.getCurrentUser();
        List<Reservation> reservations = reservationRepository.findByReservedBy_Id(user.getId());
        return  reservations.stream()
                .map(this::toResponse)
                .toList();

    }

    private Specification<Reservation>
    buildDateSpecification(
            ReservationSearchRequest request
    ) {


        if (request.date() != null ) {

            ZonedDateTime start =
                    request.date()
                            .atStartOfDay(
                                    SYSTEM_ZONE
                            );

            ZonedDateTime end =
                    request.date()
                            .plusDays(1)
                            .atStartOfDay(
                                    SYSTEM_ZONE
                            );

            return ReservationSpecifications.date(
                    start.toOffsetDateTime(),
                    end.toOffsetDateTime()
            );
        }

        Specification<Reservation> result =
                null;

        if (request.fromDate() != null) {

            ZonedDateTime from =
                    request.fromDate()
                            .atStartOfDay(
                                    SYSTEM_ZONE
                            );

            result =
                    ReservationSpecifications
                            .fromDate(
                                    from.toOffsetDateTime()
                            );
        }

        if (request.toDate() != null) {

            ZonedDateTime to =
                    request.toDate()
                            .plusDays(1)
                            .atStartOfDay(
                                    SYSTEM_ZONE
                            );

            Specification<Reservation> toSpec =
                    ReservationSpecifications
                            .toDate(
                                    to.toOffsetDateTime()
                            );

            result =
                    result == null
                            ? toSpec
                            : result.and(toSpec);
        }

        return result;
    }


    private BigDecimal addAmenities(
            Reservation reservation,
            List<ReservationAmenityRequest> requests
    ) {
        if (requests == null || requests.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal amenitiesTotal = BigDecimal.ZERO;

        Set<Long> selectedIds = new HashSet<>();

        for (ReservationAmenityRequest request : requests) {

            if (!selectedIds.add(request.amenityId())) {
                throw new IllegalArgumentException(
                        "An amenity cannot be selected more than once."
                );
            }

            Amenity amenity = amenityRepository
                    .findById(request.amenityId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Amenity not found: " + request.amenityId()
                    ));

            // Validate that this amenity can be used for this reservation.
            // Add your actual active, location, and room eligibility checks here.

            BigDecimal unitPrice = amenity.getPrice();

            BigDecimal totalPrice = unitPrice.multiply(
                    BigDecimal.valueOf(request.quantity())
            );

            ReservationAmenity reservationAmenity =
                    new ReservationAmenity();

            reservationAmenity.setReservation(reservation);
            reservationAmenity.setAmenity(amenity);
            reservationAmenity.setQuantity(request.quantity());
            reservationAmenity.setUnitPrice(unitPrice);
            reservationAmenity.setTotalPrice(totalPrice);
            //change later
            amenity.setStockQuantity(amenity.getStockQuantity() - request.quantity());
            reservation.getAmenities().add(reservationAmenity);

            amenitiesTotal = amenitiesTotal.add(totalPrice);
        }

        return amenitiesTotal;
    }


    private ReservationStatus getStatus(
            String code
    ) {

        return reservationStatusRepository
                .findByCode(code)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Reservation status '"
                                        + code
                                        + "' not found."
                        )
                );
    }
    private ReservationStatus getStatusById(
            short id
    ) {

        return reservationStatusRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Reservation status id = '"
                                        + id
                                        + "' not found."
                        )
                );
    }



    private void validateTransition(
            Reservation reservation,
            String expectedCurrentStatus,
            String targetStatus
    ) {

        String currentStatus =
                reservation
                        .getStatus()
                        .getCode();

        if (!currentStatus.equals(
                expectedCurrentStatus
        )) {

            throw new InvalidOperationException(
                    "INVALID_RESERVATION_TRANSITION",

                    "Cannot change reservation "
                            + reservation.getId()
                            + " from "
                            + currentStatus
                            + " to "
                            + targetStatus
                            + "."
            );
        }
    }
}