package com.taskscheduler.service;

import com.taskscheduler.dto.ReminderCreateRequestDTO;
import com.taskscheduler.dto.ReminderDTO;

import java.util.List;

public interface ReminderService {
    ReminderDTO createReminder(Long userId, ReminderDTO.CreateRequest request);
    List<ReminderDTO> getRemindersByUserId(Long userId);
    List<ReminderDTO> getRemindersByTaskId(Long taskId);
    ReminderDTO dismissReminder(Long userId, Long reminderId);
    void deleteReminder(Long userId, Long reminderId);
    int processDueReminders();
}
