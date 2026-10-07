package com.heng.roomrental.pricing.service;

import com.heng.roomrental.pricing.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PricingService {

    RoomPriceResponse createPrice(
            CreateRoomPriceRequest request
    );

    RoomPriceResponse getPrice(
            Long id
    );

    Page<RoomPriceResponse> search(
            RoomPriceSearchRequest request,
            Pageable pageable
    );

    List<RoomPriceResponse> getRoomPriceHistory(
            Long roomId
    );

    RoomPriceResponse updatePrice(
            Long id,
            UpdateRoomPriceRequest request
    );

    void deactivatePrice(
            Long id
    );
}