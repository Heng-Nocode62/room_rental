package com.heng.roomrental.config;

import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.role.entity.Role;
import com.heng.roomrental.role.repository.RoleRepository;
import com.heng.roomrental.user.entity.User;
import com.heng.roomrental.user.entity.UserStatus;
import com.heng.roomrental.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            RoleRepository roleRepository
    ) {
        return args -> {

            if (!userRepository.existsByUsername("admin@gmail.com")) {
                Role role = roleRepository.findByCode("ADMIN").orElseThrow(()->new ResourceNotFoundException("Role  ADMIN Not Found"));
                User admin = new User();
                admin.setUsername("admin@gmail.com");
                admin.setFirstName("admin");
                admin.setLastName("admin");
                admin.setEmail("admin@gmail.com");
                admin.setPhone("123456789");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setRoles(Set.of(role));
                admin.setStatus(UserStatus.ACTIVE);

                userRepository.save(admin);
            }



            if (!userRepository.existsByUsername("staff@gmail.com")) {

                Role roleStaff = roleRepository.findByCode("STAFF").orElseThrow(()->new ResourceNotFoundException("Role  ADMIN Not Found"));
                User staff = new User();
                staff.setUsername("staff@gmail.com");
                staff.setFirstName("Heng");
                staff.setLastName("Vath");
                staff.setEmail("staff@gmail.com");
                staff.setPhone("1234567890");
                staff.setPasswordHash(passwordEncoder.encode("staff123"));
                staff.setRoles(Set.of(roleStaff));
                staff.setStatus(UserStatus.ACTIVE);

                userRepository.save(staff);

                System.out.println("Staff user created!");
            }

        };
    }
}