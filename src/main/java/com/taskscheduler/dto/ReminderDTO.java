package com.taskscheduler.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Data Transfer Objects for Reminder operations.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JacksonXmlRootElement(localName = "Reminder")
public class ReminderDTO {

    private Long id;
    private Long taskId;
    private String taskTitle;
    private Long userId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime reminderTime;

    private String reminderMessage;
    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JacksonXmlRootElement(localName = "ReminderCreateRequest")
    public static class CreateRequest {
        @NotNull(message = "Task ID is required")
        private Long taskId;

        @NotNull(message = "Reminder time is required")
        private LocalDateTime reminderTime;

        @NotBlank(message = "Reminder message is required")
        private String reminderMessage;
    }
}
