package com.heng.roomrental.location.service;

import com.heng.roomrental.location.dto.CreateLocationRequest;
import com.heng.roomrental.location.dto.LocationResponse;
import com.heng.roomrental.location.dto.UpdateLocationRequest;

import java.util.List;

public interface LocationService {

    LocationResponse create(CreateLocationRequest request);

    LocationResponse getById(Long id);

    List<LocationResponse> getAll();

    LocationResponse update(
            Long id,
            UpdateLocationRequest request
    );

    void deactivate(Long id);
}