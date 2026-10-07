package com.heng.roomrental.payment.repository;

import com.heng.roomrental.payment.entity.Payment;
import com.heng.roomrental.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findFirstByReservation_IdOrderByCreatedAtDesc(Long reservationId);

    List<Payment> findByReservation_IdOrderByCreatedAtDesc(Long reservationId);

    Optional<Payment> findByBillNumber(String billNumber);

    @Query("""
        select p from Payment p
        where p.status = :status
          and p.qrExpiresAt > :now
        order by p.createdAt asc
    """)
    List<Payment> findActivePendingPayment(
            @Param("status") PaymentStatus status,
            @Param("now") Instant now
    );

    @Modifying
    @Query("""
        update Payment p
        set p.status = com.heng.roomrental.payment.enums.PaymentStatus.EXPIRED
        where p.status = com.heng.roomrental.payment.enums.PaymentStatus.PENDING
          and p.qrExpiresAt < :now
    """)
    int expireStalePayments(@Param("now") Instant now);
}
