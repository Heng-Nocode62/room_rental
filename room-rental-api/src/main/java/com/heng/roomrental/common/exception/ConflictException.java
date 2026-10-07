package com.heng.roomrental.common.exception;

public class ConflictException extends BusinessException {

    public ConflictException(String code, String message) {
        super(code, message);
    }

    public ConflictException(String message) {
        super("CONFLICT", message);
    }
}
