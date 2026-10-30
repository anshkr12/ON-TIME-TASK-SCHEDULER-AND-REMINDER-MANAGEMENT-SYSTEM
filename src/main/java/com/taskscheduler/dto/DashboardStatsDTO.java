package com.taskscheduler.dto;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import lombok.*;

import java.util.Map;

/**
 * DTO for Dashboard Statistics and Analytics.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JacksonXmlRootElement(localName = "DashboardStats")
public class DashboardStatsDTO {

    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private long overdueTasks;
    private long activeReminders;
    private double completionRate;
    private Map<String, Long> tasksByCategory;
    private Map<String, Long> tasksByPriority;
}
