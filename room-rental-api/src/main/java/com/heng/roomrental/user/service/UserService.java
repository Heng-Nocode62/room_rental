package com.heng.roomrental.user.service;

import com.heng.roomrental.user.dto.*;
import com.heng.roomrental.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;

public interface UserService {

    UserResponse create(
            CreateUserRequest request
    );

    UserResponse getById(
            Long id
    );

    List<UserResponse> getAll();

    UserResponse update(
            Long id,
            UpdateUserRequest request
    );

    void deactivate(
            Long id
    );

    UserResponse assignRoles(
            Long userId,
            Set<Long> roleIds
    );

    void changePassword(
            Long userId,
            ChangePasswordRequest request
    );

    void resetPassword(
            Long userId,
            ResetPasswordRequest request
    );

    void activate(Long userId
    );

    void lock(
            Long userId
    );

    void unlock(
            Long userId
    );

    User getEntityById(
            Long id
    );
    Page<UserResponse> search(
            UserSearchRequest request,
            Pageable pageable
    );
}