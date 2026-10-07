package com.heng.roomrental.common.exception;

public class InvalidSortFieldException
        extends BadRequestException {

    public InvalidSortFieldException(String message) {
        super("INVALID_SORT_FIELD", message);
    }
}