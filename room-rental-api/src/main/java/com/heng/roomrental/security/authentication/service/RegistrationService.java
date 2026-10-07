package com.heng.roomrental.security.authentication.service;

import com.heng.roomrental.common.exception.BadRequestException;
import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.role.entity.Role;
import com.heng.roomrental.role.repository.RoleRepository;
import com.heng.roomrental.security.authentication.dto.RegisterRequest;
import com.heng.roomrental.user.entity.User;
import com.heng.roomrental.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final RoleRepository roleRepository;
    @Transactional
    public void register(RegisterRequest request) {

        Optional<User> user = userRepository.findByEmail(request.email());
        if (user.isPresent()) {
            User existed = user.get();
            if (!existed.isEmailVerified()){
                existed.setFirstName(request.firstName());
                existed.setLastName(request.lastName());
                existed.setPasswordHash(passwordEncoder.encode(request.password()));
                emailVerificationService.sendOtp(request.email());
            }else
                throw new BadRequestException("Email already registered");
        }

        User newUser = new User();

        newUser.setEmail(request.email());
        newUser.setPasswordHash(
                passwordEncoder.encode(request.password())
        );

        newUser.setFirstName(request.firstName());
        newUser.setLastName(request.lastName());
        newUser.setUsername(request.email());
        newUser.setEmailVerified(false);
        Role role = roleRepository.findByCode("USER").orElseThrow(()->new ResourceNotFoundException("Role not found"));
        newUser.setRoles(Set.of(role));
        userRepository.save(newUser);

        emailVerificationService.sendOtp(request.email());
    }
}