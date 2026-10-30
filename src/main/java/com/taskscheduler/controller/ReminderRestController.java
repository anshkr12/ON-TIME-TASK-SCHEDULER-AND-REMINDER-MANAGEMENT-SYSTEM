package com.taskscheduler.controller;

import com.taskscheduler.dto.ApiResponseDTO;
import com.taskscheduler.dto.ReminderDTO;
import com.taskscheduler.service.ReminderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Reminder REST Controller.
 * Supports CRUD, manual scheduler triggers, and JSON/XML content representations.
 */
@RestController
@RequestMapping(value = "/api/reminders", produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
@Tag(name = "Reminder Management APIs", description = "Endpoints to schedule, query, dismiss, and delete task reminders")
public class ReminderRestController {

    private final ReminderService reminderService;

    @Autowired
    public ReminderRestController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    private Long resolveUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("USER_ID") != null) {
            return (Long) session.getAttribute("USER_ID");
        }
        return 1L;
    }

    @GetMapping
    @Operation(summary = "Get all reminders for current user")
    public ResponseEntity<ApiResponseDTO<List<ReminderDTO>>> getReminders(HttpServletRequest request) {
        Long userId = resolveUserId(request);
        List<ReminderDTO> reminders = reminderService.getRemindersByUserId(userId);
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(reminders, "Reminders retrieved"));
    }

    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    @Operation(summary = "Schedule a new reminder for a task")
    public ResponseEntity<ApiResponseDTO<ReminderDTO>> createReminder(@Valid @RequestBody ReminderDTO.CreateRequest body,
                                                                      HttpServletRequest request) {
        Long userId = resolveUserId(request);
        ReminderDTO created = reminderService.createReminder(userId, body);
        return new ResponseEntity<>(ApiResponseDTO.ofSuccess(created, "Reminder scheduled"), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/dismiss")
    @Operation(summary = "Dismiss an active reminder")
    public ResponseEntity<ApiResponseDTO<ReminderDTO>> dismissReminder(@PathVariable Long id, HttpServletRequest request) {
        Long userId = resolveUserId(request);
        ReminderDTO dismissed = reminderService.dismissReminder(userId, id);
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(dismissed, "Reminder dismissed"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a reminder")
    public ResponseEntity<Void> deleteReminder(@PathVariable Long id, HttpServletRequest request) {
        Long userId = resolveUserId(request);
        reminderService.deleteReminder(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/run-scheduler")
    @Operation(summary = "Trigger background scheduler sweep immediately")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> triggerScheduler() {
        int processed = reminderService.processDueReminders();
        Map<String, Object> result = new HashMap<>();
        result.put("remindersProcessed", processed);
        result.put("executedAt", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(result, "Scheduler execution cycle completed"));
    }
}
