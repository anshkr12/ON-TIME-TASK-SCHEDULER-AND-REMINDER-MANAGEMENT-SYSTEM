package com.taskscheduler.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;

/**
 * Spring Core Configuration.
 * Fulfills Module 3 Requirements:
 * - Spring Core: IoC Container & Bean Management
 * - Configuration Approaches:
 *   1. Java Configuration (@Configuration)
 *   2. Component Scanning (@ComponentScan)
 *   3. Annotation Configuration (@Bean)
 */
@Configuration
@ComponentScan(basePackages = "com.taskscheduler")
public class SpringCoreJavaConfig {

    /**
     * Demonstrates custom IoC Managed Bean declaration via Java Config
     */
    @Bean
    public SimpleDateFormat standardDateFormat() {
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    }

    @Bean
    public DateTimeFormatter standardDateTimeFormatter() {
        return DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    }

    @Bean
    public String applicationArchitectureInfo() {
        return "ON TIME Task Scheduler - Advanced Java Spring Boot Architecture (IoC Managed Bean)";
    }
}
