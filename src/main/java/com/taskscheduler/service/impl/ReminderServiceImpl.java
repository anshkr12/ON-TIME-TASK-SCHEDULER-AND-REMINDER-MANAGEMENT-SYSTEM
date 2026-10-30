package com.taskscheduler.service.impl;

import com.taskscheduler.dto.ReminderDTO;
import com.taskscheduler.entity.Reminder;
import com.taskscheduler.entity.Task;
import com.taskscheduler.entity.User;
import com.taskscheduler.exception.BadRequestException;
import com.taskscheduler.exception.ResourceNotFoundException;
import com.taskscheduler.repository.ReminderRepository;
import com.taskscheduler.repository.TaskRepository;
import com.taskscheduler.repository.UserRepository;
import com.taskscheduler.service.ReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Reminder Service Implementation.
 * Demonstrates:
 * - Module 3 Requirement: SETTER INJECTION using @Autowired on public setter methods
 * - Scheduling support & state transitions
 */
@Service
public class ReminderServiceImpl implements ReminderService {

    private ReminderRepository reminderRepository;
    private TaskRepository taskRepository;
    private UserRepository userRepository;

    // Demonstrating Setter Injection (Module 3)
    @Autowired
    public void setReminderRepository(ReminderRepository reminderRepository) {
        this.reminderRepository = reminderRepository;
    }

    @Autowired
    public void setTaskRepository(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public ReminderDTO createReminder(Long userId, ReminderDTO.CreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + request.getTaskId()));

        if (!task.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access: task belongs to another user");
        }

        Reminder reminder = Reminder.builder()
                .task(task)
                .user(user)
                .reminderTime(request.getReminderTime())
                .reminderMessage(request.getReminderMessage())
                .status(Reminder.ReminderStatus.PENDING)
                .build();

        Reminder saved = reminderRepository.save(reminder);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReminderDTO> getRemindersByUserId(Long userId) {
        return reminderRepository.findByUserIdOrderByReminderTimeAsc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReminderDTO> getRemindersByTaskId(Long taskId) {
        return reminderRepository.findByTaskId(taskId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReminderDTO dismissReminder(Long userId, Long reminderId) {
        Reminder reminder = getReminderEntity(userId, reminderId);
        reminder.setStatus(Reminder.ReminderStatus.DISMISSED);
        Reminder updated = reminderRepository.save(reminder);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteReminder(Long userId, Long reminderId) {
        Reminder reminder = getReminderEntity(userId, reminderId);
        reminderRepository.delete(reminder);
    }

    @Override
    @Transactional
    public int processDueReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<Reminder> dueReminders = reminderRepository.findByStatusAndReminderTimeBefore(Reminder.ReminderStatus.PENDING, now);

        for (Reminder r : dueReminders) {
            r.setStatus(Reminder.ReminderStatus.SENT);
            reminderRepository.save(r);
        }
        return dueReminders.size();
    }

    private Reminder getReminderEntity(Long userId, Long reminderId) {
        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + reminderId));

        if (!reminder.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to requested reminder");
        }
        return reminder;
    }

    private ReminderDTO mapToDTO(Reminder reminder) {
        return ReminderDTO.builder()
                .id(reminder.getId())
                .taskId(reminder.getTask().getId())
                .taskTitle(reminder.getTask().getTitle())
                .userId(reminder.getUser().getId())
                .reminderTime(reminder.getReminderTime())
                .reminderMessage(reminder.getReminderMessage())
                .status(reminder.getStatus().name())
                .createdAt(reminder.getCreatedAt())
                .build();
    }
}
