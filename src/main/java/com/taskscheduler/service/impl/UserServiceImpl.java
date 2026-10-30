package com.taskscheduler.service.impl;

import com.taskscheduler.dto.AuthRequestDTO;
import com.taskscheduler.dto.UserDTO;
import com.taskscheduler.entity.Role;
import com.taskscheduler.entity.User;
import com.taskscheduler.exception.BadRequestException;
import com.taskscheduler.exception.ResourceNotFoundException;
import com.taskscheduler.exception.UnauthorizedException;
import com.taskscheduler.repository.RoleRepository;
import com.taskscheduler.repository.UserRepository;
import com.taskscheduler.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * User Service Implementation.
 * Demonstrates:
 * - Module 3 Requirement: FIELD INJECTION using @Autowired on private fields
 * - Transaction Management using @Transactional
 * - DTO Pattern & Entity Mapping
 */
@Service
public class UserServiceImpl implements UserService {

    // Demonstrating Field Injection (Module 3)
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserDTO register(AuthRequestDTO.Register request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with email " + request.getEmail() + " already exists");
        }

        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirmation password do not match");
        }

        // Fetch or create default role ROLE_USER
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .roles(roles)
                .build();

        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthRequestDTO.Response login(AuthRequestDTO.Login request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials: user not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials: incorrect password");
        }

        String simulatedToken = "jwt_" + UUID.randomUUID().toString().replace("-", "");

        return AuthRequestDTO.Response.builder()
                .token(simulatedToken)
                .tokenType("Bearer")
                .user(mapToDTO(user))
                .message("Login successful")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        User user = getUserEntityById(id);
        return mapToDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> findAll() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    private UserDTO mapToDTO(User user) {
        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return UserDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .enabled(user.getEnabled())
                .roles(roleNames)
                .build();
    }
}
