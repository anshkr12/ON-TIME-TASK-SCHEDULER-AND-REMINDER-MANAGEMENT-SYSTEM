package com.taskscheduler.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Swagger OpenAPI 3.0 Configuration.
 * Fulfills Swagger OpenAPI Integration Requirements:
 * - OpenAPI Specification v3
 * - Bearer JWT / Session Security Scheme
 * - API Tagging and Documentation
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ON TIME - Task Scheduler & Reminder Management REST API")
                        .version("1.0.0 & 2.0.0")
                        .description("Comprehensive REST API documentation for the ON TIME Task Scheduler. " +
                                "Demonstrates Spring Boot 3, Spring Data JPA, Spring Security, DTO patterns, " +
                                "URI/Header/Parameter API versioning, and Jackson XML/JSON content negotiation.")
                        .contact(new Contact()
                                .name("Task Scheduler Development Team")
                                .email("developer@taskscheduler.com")
                                .url("https://ai.studio"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://spring.io/projects/spring-boot")))
                .servers(List.of(
                        new Server().url("/").description("Current Active Server"),
                        new Server().url("http://localhost:8080").description("Local Spring Boot Embedded Tomcat Instance")
                ))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth", new SecurityScheme()
                                .name("BearerAuth")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT Bearer token obtained from /api/auth/login")));
    }
}
