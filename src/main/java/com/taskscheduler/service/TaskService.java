package com.taskscheduler.service;

import com.taskscheduler.dto.DashboardStatsDTO;
import com.taskscheduler.dto.TaskCreateRequestDTO;
import com.taskscheduler.dto.TaskDTO;
import com.taskscheduler.dto.TaskUpdateRequestDTO;

import java.util.List;

public interface TaskService {
    TaskDTO createTask(Long userId, TaskDTO.CreateRequest request);
    TaskDTO updateTask(Long userId, Long taskId, TaskDTO.UpdateRequest request);
    TaskDTO getTaskById(Long userId, Long taskId);
    List<TaskDTO> getTasksByUserId(Long userId);
    List<TaskDTO> getTasksByFilter(Long userId, Boolean completed, String category, String priority);
    void deleteTask(Long userId, Long taskId);
    TaskDTO toggleComplete(Long userId, Long taskId);
    DashboardStatsDTO getDashboardStats(Long userId);
}
