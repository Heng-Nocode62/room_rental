package com.heng.roomrental.common.exception;

public class InvalidOperationException extends BusinessException {

    public InvalidOperationException(String code, String message) {
        super(code, message);
    }

    public InvalidOperationException(String message) {
        super("INVALID_OPERATION", message);
    }
}