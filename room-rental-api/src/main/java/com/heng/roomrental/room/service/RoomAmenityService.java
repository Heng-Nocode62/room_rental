package com.heng.roomrental.room.service;

import com.heng.roomrental.room.dto.RoomAmenityRequest;
import com.heng.roomrental.room.dto.RoomAmenityResponse;

import java.util.List;

public interface RoomAmenityService {

    List<RoomAmenityResponse> getAmenities(Long roomId);

    void addAmenity(Long roomId, RoomAmenityRequest request);

    void removeAmenity(Long roomId, Long amenityId, Integer amount);

    default void removeAmenity(Long roomId, Long amenityId) {
        removeAmenity(roomId, amenityId, null); // null = remove all
    }
}
