package com.taskscheduler;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Spring Boot Application Entry Point.
 * Demonstrates:
 * - @SpringBootApplication: Auto-configuration, Component Scanning, Configuration
 * - @EnableScheduling: Background task scheduler automation
 * - @ServletComponentScan: Automatic discovery and registration of GenericServlet, HttpServlet, and Filters
 */
@SpringBootApplication
@EnableScheduling
@ServletComponentScan(basePackages = "com.taskscheduler.servlet")
public class TaskSchedulerApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskSchedulerApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("ON TIME - Task Scheduler & Reminder Management Spring Boot Server");
        System.out.println("Application running on: http://localhost:8080");
        System.out.println("Swagger UI Documentation: http://localhost:8080/swagger-ui.html");
        System.out.println("H2 In-Memory Console: http://localhost:8080/h2-console");
        System.out.println("Servlet & JSP Demos: http://localhost:8080/servlet/http-demo");
        System.out.println("==================================================================");
    }
}
