package com.heng.roomrental.payment.controller;

import com.heng.roomrental.payment.dto.request.InitiatePaymentRequest;
import com.heng.roomrental.payment.dto.response.PaymentInitiateResponse;
import com.heng.roomrental.payment.dto.response.PaymentStatusResponse;
import com.heng.roomrental.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payments")
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentInitiateResponse> initiate(@Valid @RequestBody InitiatePaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.initiatePayment(request));
    }

    @GetMapping("/{paymentId}")
    public PaymentStatusResponse getById(@PathVariable Long paymentId) {
        return paymentService.getById(paymentId);
    }

    @GetMapping("/{paymentId}/status")
    public PaymentStatusResponse status(@PathVariable Long paymentId) {
        return paymentService.checkPaymentStatus(paymentId);
    }

    @PostMapping("/{paymentId}/cancel")
    public PaymentStatusResponse cancel(@PathVariable Long paymentId) {
        return paymentService.cancelPayment(paymentId);
    }
}
