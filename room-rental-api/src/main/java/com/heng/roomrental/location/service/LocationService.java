package com.heng.roomrental.location.service;

import com.heng.roomrental.location.dto.CreateLocationRequest;
import com.heng.roomrental.location.dto.LocationResponse;
import com.heng.roomrental.location.dto.UpdateLocationRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface LocationService {

    LocationResponse create(CreateLocationRequest request);

    LocationResponse getById(Long id);

    List<LocationResponse> getAll();

    LocationResponse update(
            Long id,
            UpdateLocationRequest request
    );

    LocationResponse updateImage(
            Long id,
            MultipartFile image
    );

    void deactivate(Long id);
}