package com.heng.roomrental.common.exception;

public class RoomNotAvailableException
        extends ConflictException {

    public RoomNotAvailableException(String message) {
        super("ROOM_NOT_AVAILABLE", message);
    }
}