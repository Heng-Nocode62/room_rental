package com.heng.roomrental.user.controller;

import com.heng.roomrental.common.dto.PageResponse;
import com.heng.roomrental.user.dto.*;
import com.heng.roomrental.user.entity.UserStatus;
import com.heng.roomrental.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(
            @Valid
            @RequestBody
            CreateUserRequest request
    ) {

        return userService.create(
                request
        );
    }


    @GetMapping
    public PageResponse<UserResponse> search(

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            UserStatus status,

            @RequestParam(required = false)
            Long roleId,

            @PageableDefault(
                    size = 20,
                    sort = "username",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable
    ) {

        UserSearchRequest request =
                new UserSearchRequest(
                        keyword,
                        status,
                        roleId
                );

        return PageResponse.from(
                userService.search(
                        request,
                        pageable
                )
        );
    }


    @GetMapping("/{id}")
    public UserResponse getById(
            @PathVariable Long id
    ) {

        return userService.getById(
                id
        );
    }


    @PutMapping("/{id}")
    public UserResponse update(
            @PathVariable Long id,

            @Valid
            @RequestBody
            UpdateUserRequest request
    ) {

        return userService.update(
                id,
                request
        );
    }

    @PutMapping("/{id}/roles")
    public UserResponse assignRoles(
            @PathVariable Long id,

            @Valid
            @RequestBody
            AssignRolesRequest request
    ) {

        return userService.assignRoles(
                id,
                request.roleIds()
        );
    }



    @PutMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            @PathVariable Long id,
            @Valid
            @RequestBody
            ChangePasswordRequest request
    ) {

        userService.changePassword(
                id,
                request
        );
    }


    @PutMapping("/{id}/password/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(
            @PathVariable Long id,
            @Valid
            @RequestBody
            ResetPasswordRequest request
    ) {

        userService.resetPassword(
                id,
                request
        );
    }


    @PostMapping("/{id}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(
            @PathVariable Long id
    ) {

        userService.activate(id);
    }


    @PostMapping("/{id}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(
            @PathVariable Long id
    ) {

        userService.deactivate(id);
    }


    @PostMapping("/{id}/lock")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void lock(
            @PathVariable Long id
    ) {

        userService.lock(id);
    }


    @PostMapping("/{id}/unlock")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlock(
            @PathVariable Long id
    ) {

        userService.unlock(id);
    }

}