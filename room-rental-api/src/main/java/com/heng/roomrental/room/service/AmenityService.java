package com.heng.roomrental.room.service;

import com.heng.roomrental.room.dto.AmenityResponse;
import com.heng.roomrental.room.dto.AmenitySearchRequest;
import com.heng.roomrental.room.dto.CreateAmenityRequest;
import com.heng.roomrental.room.dto.UpdateAmenityRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AmenityService {
    AmenityResponse create(CreateAmenityRequest request);
    AmenityResponse getById(Long id);
    Page<AmenityResponse> getAll(
            AmenitySearchRequest request,
            Pageable pageable
    );

    Page<AmenityResponse> getByLocationId(
            Long locationId,
            AmenitySearchRequest request,
            Pageable pageable
    );
    AmenityResponse update(Long id, UpdateAmenityRequest request);
    void deactivate(Long id);
}
