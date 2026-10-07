package com.heng.roomrental.room.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateRoomTypeRequest(

        @NotBlank
        @Size(max = 100)
        String name,

        String description,

        @Min(1)
        int capacity
) {
}