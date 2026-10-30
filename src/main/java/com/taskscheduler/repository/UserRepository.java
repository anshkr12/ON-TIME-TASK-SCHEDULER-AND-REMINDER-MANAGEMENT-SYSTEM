package com.taskscheduler.repository;

import com.taskscheduler.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * User Repository demonstrating Spring Data JPA JpaRepository.
 * Provides standard CRUD, pagination, and sorting capabilities.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
