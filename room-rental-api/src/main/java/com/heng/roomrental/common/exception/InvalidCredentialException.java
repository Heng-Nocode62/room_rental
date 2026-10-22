package com.heng.roomrental.common.exception;

public class InvalidCredentialException extends  BusinessException{
    public InvalidCredentialException() {
        super("INVALID_CREDENTIAL", "Invalid email or password");
    }
    public InvalidCredentialException(String message) {
        super("INVALID_CREDENTIAL",message);
    }
}
