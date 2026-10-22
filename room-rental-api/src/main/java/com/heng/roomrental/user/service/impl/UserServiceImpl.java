package com.heng.roomrental.user.service.impl;

import com.heng.roomrental.common.exception.ConflictException;
import com.heng.roomrental.common.exception.InvalidOperationException;
import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.common.web.SortValidator;
import com.heng.roomrental.role.dto.RoleResponse;
import com.heng.roomrental.role.entity.Role;
import com.heng.roomrental.role.repository.RoleRepository;
import com.heng.roomrental.security.CurrentUserService;
import com.heng.roomrental.security.refresh.RefreshTokenService;
import com.heng.roomrental.user.dto.*;
import com.heng.roomrental.user.entity.User;
import com.heng.roomrental.user.entity.UserStatus;
import com.heng.roomrental.user.mapper.UserMapper;
import com.heng.roomrental.user.repository.UserRepository;
import com.heng.roomrental.user.service.UserService;
import com.heng.roomrental.user.specification.UserSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl
        implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;
    private final RefreshTokenService  refreshTokenService;
    private final SortValidator sortValidator;



    @Override
    @PreAuthorize("hasAuthority('USER_CREATE')")
    @Transactional
    public UserResponse create(
            CreateUserRequest request
    ) {
        String username = request.username().trim();

        if (userRepository.existsByUsername(username)) {
            throw new ConflictException(
                    "USERNAME_ALREADY_EXISTS",
                    "Username already exists: "
                            + username
            );
        }
        if (request.email() != null
                && !request.email().isBlank()
                && userRepository.existsByEmail(
                request.email().trim()
        )) {

            throw new ConflictException(
                    "EMAIL_ALREADY_EXISTS",
                    "Email already exists."
            );
        }


        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEmail(normalizeNullable(request.email()));
        user.setPhone(normalizeNullable(request.phone()));
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        Role userRole = roleRepository.findById(request.roleId()).orElseThrow(()->new ResourceNotFoundException("Role not found"));
        user.setRoles(Set.of(userRole));
        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    @Override
    @PreAuthorize("hasAuthority('USER_VIEW')")
    @Transactional(readOnly = true)
    public UserResponse getById(
            Long id
    ) {

        return userMapper.toResponse(
                getEntityById(id)
        );
    }


    @Override
    @PreAuthorize("hasAuthority('USER_VIEW')")
    @Transactional(readOnly = true)
    public List<UserResponse> getAll() {

        return userRepository
                .findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }
    @Override
    @PreAuthorize("hasAuthority('USER_VIEW')")
    @Transactional(readOnly = true)
    public Page<UserResponse> search(
            UserSearchRequest request,
            Pageable pageable
    ) {

        sortValidator.validate(
                pageable,
                Set.of(
                        "username",
                        "firstName",
                        "lastName",
                        "createdAt"
                )
        );

        Specification<User> specification =
                Specification.allOf(

                        UserSpecifications.keyword(
                                request.keyword()
                        ),

                        UserSpecifications.status(
                                request.status()
                        ),

                        UserSpecifications.role(
                                request.roleId()
                        )
                );

        return userRepository
                .findAll(
                        specification,
                        pageable
                )
                .map(userMapper::toResponse);
    }



    @Override
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Transactional
    public UserResponse update(
            Long id,
            UpdateUserRequest request
    ) {

        User user = getEntityById(id);

        String email = normalizeNullable(request.email());

        if (email != null
                && !email.equals(
                user.getEmail()
        )
                && userRepository.existsByEmail(
                email
        )) {

            throw new ConflictException(
                    "EMAIL_ALREADY_EXISTS",
                    "Email already exists."
            );
        }


        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEmail(email);

        user.setPhone(normalizeNullable(request.phone()));


        return userMapper.toResponse(
                userRepository.save(user)
        );
    }


    @Override
    @PreAuthorize("hasAuthority('USER_ROLE_MANAGE')")
    @Transactional
    public UserResponse assignRoles(
            Long userId,
            Set<Long> roleIds
    ) {

        User user =
                getEntityById(userId);


        List<Role> roles =
                roleRepository.findAllById(
                        roleIds
                );


        if (roles.size()
                != roleIds.size()) {

            Set<Long> foundIds =
                    roles.stream()
                            .map(Role::getId)
                            .collect(
                                    java.util.stream.Collectors
                                            .toSet()
                            );

            Set<Long> missingIds =
                    new HashSet<>(roleIds);

            missingIds.removeAll(
                    foundIds
            );

            throw new ResourceNotFoundException(
                    "Roles not found: "
                            + missingIds
            );
        }


        validateAdminSafety(
                user,
                roles
        );



        user.getRoles().clear();

        user.getRoles().addAll(
                roles
        );



        User saved =
                userRepository.save(user);

        return userMapper.toResponse(saved);
    }



    @Override
    @Transactional(readOnly = true)
    public User getEntityById(
            Long id
    ) {

        return userRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: "
                                        + id
                        )
                );
    }


    @Override
    @Transactional
    public void changePassword(
            Long userId,
            ChangePasswordRequest request
    ) {

        User currentUser =
                currentUserService.getCurrentUser();

        if (!currentUser.getId().equals(userId)) {

            throw new ConflictException(
                    "PASSWORD_CHANGE_FORBIDDEN",
                    "You can only change your own password."
            );
        }

        if (!passwordEncoder.matches(
                request.currentPassword(),
                currentUser.getPasswordHash()
        )) {

            throw new InvalidOperationException(
                    "INVALID_CURRENT_PASSWORD",
                    "Current password is incorrect."
            );
        }

        if (passwordEncoder.matches(
                request.newPassword(),
                currentUser.getPasswordHash()
        )) {

            throw new InvalidOperationException(
                    "PASSWORD_MUST_BE_DIFFERENT",
                    "New password must be different from "
                            + "the current password."
            );
        }

        currentUser.setPasswordHash(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        userRepository.save(currentUser);

        refreshTokenService.revokeAllForUser(
                currentUser.getId()
        );

//        auditService.log(
//                currentUser,
//                AuditAction.PASSWORD_CHANGE,
//                AuditEntityType.USER,
//                currentUser.getId(),
//                null,
//                new UserPasswordAuditSnapshot(
//                        "PASSWORD_CHANGED"
//                )
//        );
    }
    @Override
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Transactional
    public void resetPassword(
            Long userId,
            ResetPasswordRequest request
    ) {

        User user =
                getEntityById(userId);

        User currentUser =
                currentUserService.getCurrentUser();

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        userRepository.save(user);

        refreshTokenService.revokeAllForUser(
                user.getId()
        );

//        auditService.log(
//                currentUser,
//                AuditAction.PASSWORD_RESET,
//                AuditEntityType.USER,
//                user.getId(),
//                null,
//                new UserPasswordAuditSnapshot(
//                        "PASSWORD_RESET"
//                )
//        );
    }

    @Override
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Transactional
    public void activate(
            Long userId
    ) {

        User user =
                getEntityById(userId);

        if (user.getStatus() == UserStatus.ACTIVE) {

            throw new InvalidOperationException(
                    "USER_ALREADY_ACTIVE",
                    "User is already active."
            );
        }

        UserStatus oldStatus =
                user.getStatus();

        user.setStatus(
                UserStatus.ACTIVE
        );

        userRepository.save(user);

    }

    @Override
    @PreAuthorize("hasAuthority('USER_DEACTIVATE')")
    @Transactional
    public void deactivate(
            Long userId
    ) {

        User user =
                getEntityById(userId);

        if (user.getStatus() == UserStatus.INACTIVE) {

            throw new InvalidOperationException(
                    "USER_ALREADY_INACTIVE",
                    "User is already inactive."
            );
        }

        protectLastAdmin(
                user
        );

        UserStatus oldStatus =
                user.getStatus();

        user.setStatus(
                UserStatus.INACTIVE
        );

        userRepository.save(user);

        refreshTokenService.revokeAllForUser(
                user.getId()
        );


    }

    @Override
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Transactional
    public void lock(
            Long userId
    ) {

        User user =
                getEntityById(userId);

        protectLastAdmin(
                user
        );

        if (user.getStatus() == UserStatus.LOCKED) {

            throw new InvalidOperationException(
                    "USER_ALREADY_LOCKED",
                    "User is already locked."
            );
        }

        UserStatus oldStatus =
                user.getStatus();

        user.setStatus(
                UserStatus.LOCKED
        );

        userRepository.save(user);

        refreshTokenService.revokeAllForUser(
                user.getId()
        );


    }

    @Override
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Transactional
    public void unlock(
            Long userId
    ) {

        User user = getEntityById(userId);

        if (user.getStatus() != UserStatus.LOCKED) {

            throw new InvalidOperationException(
                    "USER_NOT_LOCKED",
                    "User is not locked."
            );
        }

        user.setStatus(
                UserStatus.ACTIVE
        );

        userRepository.save(user);


    }

    private void protectLastAdmin(
            User user
    ) {

        boolean isAdmin =
                user.getRoles()
                        .stream()
                        .anyMatch(role ->
                                "ADMIN".equals(
                                        role.getCode()
                                )
                        );

        if (!isAdmin) {
            return;
        }

        long adminCount =
                userRepository
                        .countByRoles_Code(
                                "ADMIN"
                        );

        if (adminCount <= 1) {

            throw new ConflictException(
                    "LAST_ADMIN_CANNOT_BE_MODIFIED",
                    "The last administrator cannot "
                            + "be deactivated or locked."
            );
        }
    }



    private void validateAdminSafety(
            User user,
            List<Role> newRoles
    ) {

        boolean currentlyAdmin =
                user.getRoles()
                        .stream()
                        .anyMatch(role ->
                                "ADMIN".equals(
                                        role.getCode()
                                )
                        );

        boolean remainsAdmin =
                newRoles
                        .stream()
                        .anyMatch(role ->
                                "ADMIN".equals(
                                        role.getCode()
                                )
                        );


        // Nothing dangerous is happening.
        if (!currentlyAdmin
                || remainsAdmin) {

            return;
        }


        long adminCount =
                userRepository
                        .countByRoles_Code(
                                "ADMIN"
                        );

        if (adminCount <= 1) {

            throw new ConflictException(
                    "LAST_ADMIN_CANNOT_BE_REMOVED",
                    "The last administrator cannot "
                            + "be removed from the ADMIN role."
            );
        }
    }





    private String normalizeNullable(
            String value
    ) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}