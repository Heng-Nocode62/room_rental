package com.heng.roomrental.common.exception;

public class BadRequestException extends BusinessException {

    public BadRequestException(String message) {
        super("BAD_REQUEST", message);
    }

    public BadRequestException(
            String code,
            String message
    ) {
        super(code, message);
    }
}