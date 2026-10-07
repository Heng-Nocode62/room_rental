package com.heng.roomrental.reservation.service.impl;

import com.heng.roomrental.common.exception.ConflictException;
import com.heng.roomrental.common.exception.InvalidOperationException;
import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.common.web.SortValidator;
import com.heng.roomrental.reservation.dto.CreateRoomBlockRequest;
import com.heng.roomrental.reservation.dto.RoomBlockResponse;
import com.heng.roomrental.reservation.dto.RoomBlockSearchRequest;
import com.heng.roomrental.reservation.entity.*;
import com.heng.roomrental.reservation.repository.RoomBlockRepository;
import com.heng.roomrental.reservation.repository.ReservationRepository;
import com.heng.roomrental.reservation.service.RoomBlockService;
import com.heng.roomrental.reservation.specification.RoomBlockSpecifications;
import com.heng.roomrental.room.entity.Room;
import com.heng.roomrental.room.repository.RoomRepository;
import com.heng.roomrental.security.CurrentUserService;
import com.heng.roomrental.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RoomBlockServiceImpl
        implements RoomBlockService {

    private final RoomBlockRepository roomBlockRepository;

    private final ReservationRepository reservationRepository;

    private final RoomRepository roomRepository;

    private final CurrentUserService currentUserService;
    private final SortValidator sortValidator;

    private static final ZoneId SYSTEM_ZONE =
            ZoneId.of("Asia/Phnom_Penh");



    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROOM_BLOCK_CREATE')")
    public RoomBlockResponse create(
            CreateRoomBlockRequest request
    ) {

        validateTimeRange(
                request.startAt(),
                request.endAt()
        );

        Room room =
                roomRepository.findById(
                        request.roomId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room with id "
                                        + request.roomId()
                                        + " not found."
                        )
                );



        boolean blockConflict =
                roomBlockRepository
                        .existsOverlappingBlock(
                                room.getId(),
                                request.startAt(),
                                request.endAt()
                        );

        if (blockConflict) {

            throw new ConflictException(
                    "ROOM_ALREADY_BLOCKED",
                    "Room is already blocked "
                            + "during the selected time."
            );
        }



        boolean reservationConflict =
                reservationRepository
                        .existsOverlappingReservation(
                                room.getId(),
                                request.startAt(),
                                request.endAt()
                        );

        RoomBlock block = getRoomBlock(request, reservationConflict, room);


        RoomBlock saved = roomBlockRepository.save(block);

        return toResponse(saved);
    }

    private @NonNull RoomBlock getRoomBlock(CreateRoomBlockRequest request, boolean reservationConflict, Room room) {
        if (reservationConflict) {

            throw new ConflictException(
                    "ROOM_HAS_RESERVATION",
                    "Room already has a reservation "
                            + "during the selected time."
            );
        }


        User currentUser =
                currentUserService.getCurrentUser();


        RoomBlock block =
                new RoomBlock();

        block.setRoom(room);

        block.setBlockType(request.blockType());

        block.setStatus(RoomBlockStatus.ACTIVE);

        block.setStartAt(request.startAt());

        block.setEndAt(request.endAt());

        block.setReason(request.reason());

        block.setNotes(request.notes());

        block.setCreatedBy(currentUser);
        return block;
    }


    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('ROOM_BLOCK_VIEW')")
    public RoomBlockResponse getById(
            Long id
    ) {

        RoomBlock block =
                getEntityById(id);

        return toResponse(block);
    }



    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('ROOM_BLOCK_VIEW')")
    public List<RoomBlockResponse> getByRoom(
            Long roomId
    ) {

        return roomBlockRepository
                .findByRoomIdOrderByStartAtAsc(roomId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @PreAuthorize("hasAuthority('ROOM_BLOCK_VIEW')")
    @Transactional(readOnly = true)
    public Page<RoomBlockResponse> search(
            RoomBlockSearchRequest request,
            Pageable pageable
    ) {

        sortValidator.validate(
                pageable,
                Set.of(
                        "startAt",
                        "endAt",
                        "createdAt"
                )
        );
        Specification<RoomBlock> specification =
                Specification.allOf(

                        RoomBlockSpecifications.keyword(
                                request.keyword()
                        ),

                        RoomBlockSpecifications.room(
                                request.roomId()
                        ),

                        RoomBlockSpecifications.location(
                                request.locationId()
                        ),

                        RoomBlockSpecifications.blockType(
                                request.blockType()
                        ),

                        RoomBlockSpecifications.status(
                                request.status()
                        ),

                        buildDateSpecification(request)
                );

        return roomBlockRepository
                .findAll(
                        specification,
                        pageable
                )
                .map(this::toResponse);
    }


    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROOM_BLOCK_CANCEL')")
    public RoomBlockResponse cancel(
            Long id
    ) {

        RoomBlock block =
                getEntityById(id);

        if (block.getStatus()
                != RoomBlockStatus.ACTIVE) {

            throw new InvalidOperationException(
                    "INVALID_ROOM_BLOCK_STATUS",
                    "Only active room blocks "
                            + "can be cancelled."
            );
        }

        block.setStatus(
                RoomBlockStatus.CANCELLED
        );

        return toResponse(
                roomBlockRepository.save(block)
        );
    }



    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROOM_BLOCK_COMPLETE')")
    public RoomBlockResponse complete(
            Long id
    ) {

        RoomBlock block =
                getEntityById(id);

        if (block.getStatus()
                != RoomBlockStatus.ACTIVE) {

            throw new InvalidOperationException(
                    "INVALID_ROOM_BLOCK_STATUS",
                    "Only active room blocks "
                            + "can be completed."
            );
        }

        block.setStatus(
                RoomBlockStatus.COMPLETED
        );

        return toResponse(
                roomBlockRepository.save(block)
        );
    }



    private RoomBlock getEntityById(
            Long id
    ) {

        return roomBlockRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room block with id "
                                        + id
                                        + " not found."
                        )
                );
    }



    private void validateTimeRange(
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {

        if (startAt == null
                || endAt == null) {

            throw new IllegalArgumentException(
                    "Start time and end time are required."
            );
        }

        if (!endAt.isAfter(startAt)) {

            throw new IllegalArgumentException(
                    "End time must be after start time."
            );
        }
    }


    private RoomBlockResponse toResponse(
            RoomBlock block
    ) {

        User createdBy =
                block.getCreatedBy();

        return new RoomBlockResponse(
                block.getId(),

                block.getRoom().getId(),
                block.getRoom().getRoomNumber(),
                block.getRoom().getName(),

                block.getBlockType(),
                block.getStatus(),

                block.getStartAt(),
                block.getEndAt(),

                block.getReason(),
                block.getNotes(),

                createdBy.getId(),

                createdBy.getFirstName()
                        + " "
                        + createdBy.getLastName()
        );
    }

    private Specification<RoomBlock>
    buildDateSpecification(
            RoomBlockSearchRequest request
    ) {

        if (request.date() != null) {

            ZonedDateTime start =
                    request.date()
                            .atStartOfDay(SYSTEM_ZONE);

            ZonedDateTime end =
                    request.date()
                            .plusDays(1)
                            .atStartOfDay(SYSTEM_ZONE);

            return RoomBlockSpecifications.overlaps(
                    start.toOffsetDateTime(),
                    end.toOffsetDateTime()
            );
        }

        Specification<RoomBlock> specification =
                null;

        if (request.fromDate() != null) {

            ZonedDateTime start =
                    request.fromDate()
                            .atStartOfDay(SYSTEM_ZONE);

            specification =
                    RoomBlockSpecifications.startsFrom(
                            start.toOffsetDateTime()
                    );
        }

        if (request.toDate() != null) {

            ZonedDateTime end =
                    request.toDate()
                            .plusDays(1)
                            .atStartOfDay(SYSTEM_ZONE);

            Specification<RoomBlock> toSpecification =
                    RoomBlockSpecifications.startsBefore(
                            end.toOffsetDateTime()
                    );

            specification =
                    specification == null
                            ? toSpecification
                            : specification.and(
                            toSpecification
                    );
        }

        return specification;
    }
}