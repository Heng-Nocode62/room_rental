package com.heng.roomrental.user.dto;

import com.heng.roomrental.user.entity.UserStatus;

public record UserSearchRequest(

        String keyword,

        UserStatus status,

        Long roleId
) {
}