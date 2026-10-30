package com.taskscheduler.service;

import com.taskscheduler.dto.AuthRequestDTO;
import com.taskscheduler.dto.UserDTO;
import com.taskscheduler.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    UserDTO register(AuthRequestDTO.Register request);
    AuthRequestDTO.Response login(AuthRequestDTO.Login request);
    UserDTO findById(Long id);
    UserDTO findByEmail(String email);
    User getUserEntityById(Long id);
    List<UserDTO> findAll();
    boolean existsByEmail(String email);
}
