package com.taskscheduler.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standardized Error Response representation for @ControllerAdvice.
 * Handles HTTP 400, 401, 403, 404, and 500 status codes.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JacksonXmlRootElement(localName = "ErrorResponse")
public class ErrorResponseDTO {

    private int status;
    private String error;
    private String message;
    private String path;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    private List<String> validationErrors;
}
