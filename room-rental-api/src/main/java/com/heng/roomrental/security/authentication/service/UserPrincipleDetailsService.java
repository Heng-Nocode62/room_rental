package com.heng.roomrental.security.authentication.service;

import com.heng.roomrental.user.entity.User;
import com.heng.roomrental.user.repository.UserRepository;
import com.heng.roomrental.user.security.UserPrincipal;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class UserPrincipleDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("Invalid email or password"));
        return UserPrincipal.from(user);
    }
}
