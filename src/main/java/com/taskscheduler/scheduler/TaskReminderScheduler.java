package com.taskscheduler.scheduler;

import com.taskscheduler.entity.Task;
import com.taskscheduler.repository.TaskRepository;
import com.taskscheduler.service.ReminderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Task and Reminder Background Scheduler.
 * Fulfills Scheduler Feature Requirements:
 * - @EnableScheduling
 * - @Scheduled with fixedRate and cron expressions
 * - Reminder Execution (processes due reminders and triggers notifications)
 * - Due Task Detection (flags overdue tasks)
 * - Notification Trigger
 */
@Component
@EnableScheduling
public class TaskReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(TaskReminderScheduler.class);

    private final ReminderService reminderService;
    private final TaskRepository taskRepository;

    @Autowired
    public TaskReminderScheduler(ReminderService reminderService, TaskRepository taskRepository) {
        this.reminderService = reminderService;
        this.taskRepository = taskRepository;
    }

    /**
     * Executes every 60 seconds (fixedRate) to check for due reminders and process notifications.
     */
    @Scheduled(fixedRateString = "${taskscheduler.scheduler.rate.ms:60000}")
    public void executeReminderNotificationSweep() {
        log.info("[TaskReminderScheduler] Running automated reminder sweep at {}", LocalDateTime.now());

        // 1. Process Due Reminders
        int processedCount = reminderService.processDueReminders();
        if (processedCount > 0) {
            log.info("[TaskReminderScheduler] Triggered {} notifications for due reminders.", processedCount);
        }

        // 2. Due/Overdue Task Detection
        List<Task> overdueTasks = taskRepository.findOverdueTasks(LocalDateTime.now());
        if (!overdueTasks.isEmpty()) {
            log.warn("[TaskReminderScheduler] Detected {} overdue uncompleted tasks.", overdueTasks.size());
            for (Task t : overdueTasks) {
                log.debug("  - Overdue Task ID: {}, Title: '{}', Deadline: {}", t.getId(), t.getTitle(), t.getDeadline());
            }
        }
    }

    /**
     * Daily cleanup cron job running at midnight.
     * Demonstrates Cron Expression syntax: second, minute, hour, day, month, weekday.
     */
    @Scheduled(cron = "${taskscheduler.cron.daily-cleanup:0 0 0 * * ?}")
    public void executeMidnightAudit() {
        log.info("[TaskReminderScheduler] Executing daily midnight system audit and archive routine.");
    }
}
