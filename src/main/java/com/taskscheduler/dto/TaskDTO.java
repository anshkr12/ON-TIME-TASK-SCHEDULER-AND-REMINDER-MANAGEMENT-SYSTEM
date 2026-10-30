package com.taskscheduler.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Data Transfer Objects for Task operations.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JacksonXmlRootElement(localName = "Task")
public class TaskDTO {

    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deadline;

    private Boolean completed;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JacksonXmlRootElement(localName = "TaskCreateRequest")
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;
        private String category;
        private String priority;
        private String status;

        @NotNull(message = "Deadline is required")
        private LocalDateTime deadline;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JacksonXmlRootElement(localName = "TaskUpdateRequest")
    public static class UpdateRequest {
        private String title;
        private String description;
        private String category;
        private String priority;
        private String status;
        private LocalDateTime deadline;
        private Boolean completed;
    }
}
