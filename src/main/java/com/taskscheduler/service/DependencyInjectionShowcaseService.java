package com.taskscheduler.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service specifically demonstrating and contrasting all three Spring Dependency Injection patterns
 * for Advanced Java University Syllabus evaluation:
 * 1. Constructor Injection (preferred for immutability and testability)
 * 2. Setter Injection (useful for optional dependencies or reconfiguration)
 * 3. Field Injection (direct @Autowired on private members)
 */
@Service
public class DependencyInjectionShowcaseService {

    // 1. Field Injection Example
    @Autowired
    private UserService fieldInjectedUserService;

    // 2. Setter Injection Target
    private TaskService setterInjectedTaskService;

    // 3. Constructor Injection Target
    private final ReminderService constructorInjectedReminderService;

    // Demonstrating Constructor Injection
    @Autowired
    public DependencyInjectionShowcaseService(ReminderService reminderService) {
        this.constructorInjectedReminderService = reminderService;
    }

    // Demonstrating Setter Injection
    @Autowired
    public void setSetterInjectedTaskService(TaskService taskService) {
        this.setterInjectedTaskService = taskService;
    }

    public String getDependencyInjectionSummary() {
        return "Spring Dependency Injection Demonstration: "
                + "[1] Constructor Injection: " + (constructorInjectedReminderService != null ? "ACTIVE" : "NULL") + ", "
                + "[2] Setter Injection: " + (setterInjectedTaskService != null ? "ACTIVE" : "NULL") + ", "
                + "[3] Field Injection: " + (fieldInjectedUserService != null ? "ACTIVE" : "NULL");
    }
}
