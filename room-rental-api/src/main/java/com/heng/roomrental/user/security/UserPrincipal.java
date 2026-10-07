package com.heng.roomrental.user.security;

import com.heng.roomrental.permission.entity.Permission;
import com.heng.roomrental.role.entity.Role;
import com.heng.roomrental.user.entity.User;
import com.heng.roomrental.user.entity.UserStatus;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Getter
public class UserPrincipal implements UserDetails {

    private final Long userId;
    private final String username;
    private final String password;
    private final boolean enabled;
    private final User user;
    private final Collection<? extends GrantedAuthority>
            authorities;

    public UserPrincipal(
            Long userId,
            User user,
            String username,
            String password,
            boolean enabled,
            Collection<? extends GrantedAuthority> authorities
    ) {
        this.user = user;
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.enabled = enabled;
        this.authorities = authorities;
    }

    public static UserPrincipal from(User user) {

        var authorities =
                user.getRoles()
                        .stream()
                        .filter(Role::isActive)
                        .flatMap(role ->
                                role.getPermissions()
                                        .stream()
                        )
                        .filter(Permission::isActive)
                        .map(permission ->
                                new org.springframework.security
                                        .core.authority
                                        .SimpleGrantedAuthority(
                                                permission.getCode()
                                        )
                        )
                        .toList();

        return new UserPrincipal(
                user.getId(),
                user,
                user.getUsername(),
                user.getPasswordHash(),
                user.getStatus().name().equals("ACTIVE"),
                authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority>
    getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !user.getStatus().equals(UserStatus.LOCKED);
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.getStatus().equals(UserStatus.ACTIVE);
    }
}