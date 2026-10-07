package com.heng.roomrental.location.controller;

import com.heng.roomrental.location.dto.UserLocationRoleRequest;
import com.heng.roomrental.location.dto.UserLocationRoleResponse;
import com.heng.roomrental.location.service.UserLocationRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-location-roles")
@RequiredArgsConstructor
public class UserLocationRoleController {

    private final UserLocationRoleService userLocationRoleService;

    @PostMapping
    public ResponseEntity<UserLocationRoleResponse> create(
            @RequestBody UserLocationRoleRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(userLocationRoleService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserLocationRoleResponse> update(
            @PathVariable Long id,
            @RequestBody UserLocationRoleRequest request
    ) {
        return ResponseEntity.ok(
                userLocationRoleService.update(id, request)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserLocationRoleResponse> getById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                userLocationRoleService.getById(id)
        );
    }

    @GetMapping
    public ResponseEntity<List<UserLocationRoleResponse>> getAll() {
        return ResponseEntity.ok(
                userLocationRoleService.getAll()
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserLocationRoleResponse>> getByUserId(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                userLocationRoleService.getByUserId(userId)
        );
    }

    @GetMapping("/location/{locationId}")
    public ResponseEntity<List<UserLocationRoleResponse>> getByLocationId(
            @PathVariable Long locationId
    ) {
        return ResponseEntity.ok(
                userLocationRoleService.getByLocationId(locationId)
        );
    }

    @GetMapping("/user/{userId}/location/{locationId}")
    public ResponseEntity<List<UserLocationRoleResponse>>
    getByUserAndLocation(
            @PathVariable Long userId,
            @PathVariable Long locationId
    ) {
        return ResponseEntity.ok(
                userLocationRoleService.getByUserAndLocation(
                        userId,
                        locationId
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        userLocationRoleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}