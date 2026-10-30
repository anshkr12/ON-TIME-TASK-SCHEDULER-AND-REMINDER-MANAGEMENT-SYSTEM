package com.taskscheduler.dto;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import lombok.*;

import java.util.Set;

/**
 * Data Transfer Object for User information.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JacksonXmlRootElement(localName = "User")
public class UserDTO {

    private Long id;
    private String fullName;
    private String email;
    private Boolean enabled;
    private Set<String> roles;
}
