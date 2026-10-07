package com.heng.roomrental.payment.gateway;

import com.heng.roomrental.payment.dto.GatewayInitResult;
import com.heng.roomrental.payment.dto.GatewayRefundResult;
import com.heng.roomrental.payment.dto.GatewayStatusResult;
import com.heng.roomrental.payment.dto.PaymentInitCommand;

import java.math.BigDecimal;

public interface PaymentGateway {
    GatewayInitResult initiatePayment(PaymentInitCommand command);

    GatewayStatusResult checkStatus(String gatewayReference);

    GatewayRefundResult refund(String gatewayRef, BigDecimal amount, String reason);

    String gatewayName();
}
