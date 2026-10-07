package com.heng.roomrental.pricing.repository;

import com.heng.roomrental.pricing.entity.RoomPrice;
import com.heng.roomrental.pricing.entity.RoomPriceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoomPriceRepository
        extends JpaRepository<RoomPrice, Long>, JpaSpecificationExecutor<RoomPrice> {

    List<RoomPrice> findByRoomId(Long roomId);

    List<RoomPrice> findByRoomIdAndStatus(
            Long roomId,
            RoomPriceStatus status
    );
    List<RoomPrice> findByRoomIdOrderByEffectiveFromDesc(
            Long roomId
    );

    Optional<RoomPrice> findFirstByRoomIdAndPricingUnitIdAndStatusAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
            Long roomId,
            Short pricingUnitId,
            RoomPriceStatus status,
            LocalDate date
    );

//    @Query("""
//    SELECT CASE WHEN COUNT(rp) > 0
//                THEN true
//                ELSE false
//           END
//    FROM RoomPrice rp
//    WHERE rp.room.id = :roomId
//      AND rp.pricingUnit.id = :pricingUnitId
//      AND rp.status = 'ACTIVE'
//      AND rp.effectiveFrom <= COALESCE(
//            :effectiveTo,
//            CAST('9999-12-31' AS date)
//          )
//      AND COALESCE(
//            rp.effectiveTo,
//            CAST('9999-12-31' AS date)
//          ) >= :effectiveFrom
//    """)
//    boolean existsOverlappingPrice(
//            @Param("roomId")
//            Long roomId,
//
//            @Param("pricingUnitId")
//            Short pricingUnitId,
//
//            @Param("effectiveFrom")
//            LocalDate effectiveFrom,
//
//            @Param("effectiveTo")
//            LocalDate effectiveTo
//    );

    @Query(
            value = """
        SELECT EXISTS (
            SELECT 1
            FROM room_prices rp
            WHERE rp.room_id = :roomId
              AND rp.pricing_unit_id = :pricingUnitId
              AND rp.status = 'ACTIVE'
              AND rp.effective_from <=
                    COALESCE(
                        :effectiveTo,
                        DATE '9999-12-31'
                    )
              AND COALESCE(
                    rp.effective_to,
                    DATE '9999-12-31'
                  ) >= :effectiveFrom
        )
        """,
            nativeQuery = true
    )
    boolean existsOverlappingPrice(
            @Param("roomId")
            Long roomId,

            @Param("pricingUnitId")
            Short pricingUnitId,

            @Param("effectiveFrom")
            LocalDate effectiveFrom,

            @Param("effectiveTo")
            LocalDate effectiveTo
    );

}