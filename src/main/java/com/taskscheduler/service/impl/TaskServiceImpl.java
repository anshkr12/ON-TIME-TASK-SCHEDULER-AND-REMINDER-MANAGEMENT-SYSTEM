package com.taskscheduler.service.impl;

import com.taskscheduler.dto.DashboardStatsDTO;
import com.taskscheduler.dto.TaskDTO;
import com.taskscheduler.entity.Reminder;
import com.taskscheduler.entity.Task;
import com.taskscheduler.entity.User;
import com.taskscheduler.exception.BadRequestException;
import com.taskscheduler.exception.ResourceNotFoundException;
import com.taskscheduler.repository.ReminderRepository;
import com.taskscheduler.repository.TaskRepository;
import com.taskscheduler.repository.UserRepository;
import com.taskscheduler.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Task Service Implementation.
 * Demonstrates:
 * - Module 3 Requirement: CONSTRUCTOR INJECTION
 * - Transaction Management using @Transactional
 * - CRUD Operations on JPA Repositories
 */
@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ReminderRepository reminderRepository;

    // Demonstrating Constructor Injection (Module 3)
    @Autowired
    public TaskServiceImpl(TaskRepository taskRepository,
                           UserRepository userRepository,
                           ReminderRepository reminderRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.reminderRepository = reminderRepository;
    }

    @Override
    @Transactional
    public TaskDTO createTask(Long userId, TaskDTO.CreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Task.Priority priority = Task.Priority.MEDIUM;
        if (request.getPriority() != null) {
            try {
                priority = Task.Priority.valueOf(request.getPriority().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid priority: " + request.getPriority());
            }
        }

        Task.Status status = Task.Status.TODO;
        if (request.getStatus() != null) {
            try {
                status = Task.Status.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status: " + request.getStatus());
            }
        }

        Task task = Task.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory() != null ? request.getCategory() : "Work")
                .priority(priority)
                .status(status)
                .deadline(request.getDeadline())
                .completed(status == Task.Status.DONE)
                .build();

        Task saved = taskRepository.save(task);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public TaskDTO updateTask(Long userId, Long taskId, TaskDTO.UpdateRequest request) {
        Task task = getTaskEntity(userId, taskId);

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            task.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            task.setCategory(request.getCategory());
        }
        if (request.getPriority() != null) {
            try {
                task.setPriority(Task.Priority.valueOf(request.getPriority().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }
        if (request.getStatus() != null) {
            try {
                Task.Status st = Task.Status.valueOf(request.getStatus().toUpperCase());
                task.setStatus(st);
                task.setCompleted(st == Task.Status.DONE);
            } catch (IllegalArgumentException ignored) {}
        }
        if (request.getDeadline() != null) {
            task.setDeadline(request.getDeadline());
        }
        if (request.getCompleted() != null) {
            task.setCompleted(request.getCompleted());
            if (request.getCompleted()) {
                task.setStatus(Task.Status.DONE);
            } else if (task.getStatus() == Task.Status.DONE) {
                task.setStatus(Task.Status.TODO);
            }
        }

        Task updated = taskRepository.save(task);
        return mapToDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskDTO getTaskById(Long userId, Long taskId) {
        return mapToDTO(getTaskEntity(userId, taskId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksByUserId(Long userId) {
        return taskRepository.findByUserIdOrderByDeadlineAsc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksByFilter(Long userId, Boolean completed, String category, String priority) {
        List<Task> tasks = taskRepository.findByUserIdOrderByDeadlineAsc(userId);

        return tasks.stream()
                .filter(t -> completed == null || t.getCompleted().equals(completed))
                .filter(t -> category == null || t.getCategory().equalsIgnoreCase(category))
                .filter(t -> priority == null || t.getPriority().name().equalsIgnoreCase(priority))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteTask(Long userId, Long taskId) {
        Task task = getTaskEntity(userId, taskId);
        taskRepository.delete(task);
    }

    @Override
    @Transactional
    public TaskDTO toggleComplete(Long userId, Long taskId) {
        Task task = getTaskEntity(userId, taskId);
        boolean newStatus = !task.getCompleted();
        task.setCompleted(newStatus);
        task.setStatus(newStatus ? Task.Status.DONE : Task.Status.TODO);

        Task saved = taskRepository.save(task);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats(Long userId) {
        List<Task> userTasks = taskRepository.findByUserIdOrderByDeadlineAsc(userId);
        LocalDateTime now = LocalDateTime.now();

        long total = userTasks.size();
        long completed = userTasks.stream().filter(Task::getCompleted).count();
        long pending = total - completed;
        long overdue = userTasks.stream()
                .filter(t -> !t.getCompleted() && t.getDeadline().isBefore(now))
                .count();

        long activeReminders = reminderRepository.countByUserIdAndStatus(userId, Reminder.ReminderStatus.PENDING);

        double rate = total > 0 ? ((double) completed / total) * 100.0 : 0.0;

        Map<String, Long> byCategory = new HashMap<>();
        Map<String, Long> byPriority = new HashMap<>();

        for (Task t : userTasks) {
            byCategory.put(t.getCategory(), byCategory.getOrDefault(t.getCategory(), 0L) + 1);
            byPriority.put(t.getPriority().name(), byPriority.getOrDefault(t.getPriority().name(), 0L) + 1);
        }

        return DashboardStatsDTO.builder()
                .totalTasks(total)
                .completedTasks(completed)
                .pendingTasks(pending)
                .overdueTasks(overdue)
                .activeReminders(activeReminders)
                .completionRate(Math.round(rate * 10.0) / 10.0)
                .tasksByCategory(byCategory)
                .tasksByPriority(byPriority)
                .build();
    }

    private Task getTaskEntity(Long userId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        if (!task.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to requested task");
        }
        return task;
    }

    private TaskDTO mapToDTO(Task task) {
        return TaskDTO.builder()
                .id(task.getId())
                .userId(task.getUser().getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .category(task.getCategory())
                .priority(task.getPriority().name())
                .status(task.getStatus().name())
                .deadline(task.getDeadline())
                .completed(task.getCompleted())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
