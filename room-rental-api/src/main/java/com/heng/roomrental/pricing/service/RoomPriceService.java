package com.heng.roomrental.pricing.service;

import com.heng.roomrental.pricing.dto.CreateRoomPriceRequest;
import com.heng.roomrental.pricing.dto.RoomPriceResponse;
import com.heng.roomrental.pricing.entity.RoomPrice;

public interface RoomPriceService {
    RoomPrice createRoomPrice(CreateRoomPriceRequest request);
}
