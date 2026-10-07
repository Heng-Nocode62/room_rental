package com.heng.roomrental.user.repository;

import com.heng.roomrental.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
    boolean existsByRoles_Id(Long roleId);
    long countByRoles_Code(
            String roleCode
    );
    @Query("""
    select distinct u
    from User u
    left join fetch u.roles r
    left join fetch r.permissions
    where u.id = :id
    """)
    Optional<User> findWithRolesAndPermissionsById(
            @Param("id") Long id
    );


    @Query("""
        select distinct u from User u
        left join fetch u.roles r
        left join fetch r.permissions
        where u.googleSub = :sub
    """)
    Optional<User> findByGoogleSubWithRoles(String sub);

    @Query("""
        select distinct u from User u
        left join fetch u.roles r
        left join fetch r.permissions
        where u.email = :email
    """)
    Optional<User> findByEmailWithRoles(String email);

    Optional<User> findByGoogleSub(String googleSub);


    Optional<User> findByEmail(String email);
}