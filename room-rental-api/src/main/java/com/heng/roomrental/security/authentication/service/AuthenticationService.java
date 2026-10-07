package com.heng.roomrental.security.authentication.service;

import com.heng.roomrental.security.authentication.dto.AuthMeResponse;
import com.heng.roomrental.security.authentication.dto.AuthenticationResult;
import com.heng.roomrental.security.authentication.dto.LoginRequest;
import com.heng.roomrental.user.dto.UserResponse;
import com.heng.roomrental.user.entity.User;

public interface AuthenticationService {

    AuthenticationResult login(LoginRequest request);

    AuthenticationResult refresh(String refreshToken);

    UserResponse me();
    AuthMeResponse authMe();

    void logout(String refreshToken);

    User findOrCreateGoogleUser(String subject, String email, String name, String picture);
}
