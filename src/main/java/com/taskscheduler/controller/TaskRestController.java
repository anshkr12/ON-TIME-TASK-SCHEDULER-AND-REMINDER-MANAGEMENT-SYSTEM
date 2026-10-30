package com.taskscheduler.controller;

import com.taskscheduler.dto.ApiResponseDTO;
import com.taskscheduler.dto.TaskDTO;
import com.taskscheduler.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Task REST Controller.
 * Fulfills Requirements:
 * - All HTTP Methods: GET, POST, PUT, DELETE, PATCH
 * - HTTP Status Codes: 200, 201, 204, 400, 404
 * - API Versioning:
 *   1. URI Versioning (/api/v1/tasks, /api/v2/tasks)
 *   2. Header Versioning (X-API-VERSION)
 *   3. Parameter Versioning (?version=...)
 * - JSON and XML content negotiation (Jackson XML)
 */
@RestController
@RequestMapping(produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
@Tag(name = "Task Management APIs", description = "CRUD and scheduling operations on tasks with multi-versioning and XML/JSON support")
public class TaskRestController {

    private final TaskService taskService;

    @Autowired
    public TaskRestController(TaskService taskService) {
        this.taskService = taskService;
    }

    private Long resolveUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("USER_ID") != null) {
            return (Long) session.getAttribute("USER_ID");
        }
        return 1L; // Seed user fallback
    }

    // =================================================================
    // 1. URI VERSIONING (/api/v1/tasks & /api/v2/tasks) & DEFAULT (/api/tasks)
    // =================================================================

    @GetMapping({"/api/tasks", "/api/v1/tasks"})
    @Operation(summary = "Get tasks (URI v1 / Default)", description = "Retrieves all tasks for the authenticated user.")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getTasksV1(
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            HttpServletRequest request) {
        Long userId = resolveUserId(request);
        List<TaskDTO> tasks = taskService.getTasksByFilter(userId, completed, category, priority);
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(tasks, "Tasks retrieved (API v1)"));
    }

    @GetMapping("/api/v2/tasks")
    @Operation(summary = "Get tasks (URI v2 Enhanced)", description = "Retrieves all tasks with enhanced v2 metadata envelope.")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getTasksV2(HttpServletRequest request) {
        Long userId = resolveUserId(request);
        List<TaskDTO> tasks = taskService.getTasksByUserId(userId);
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(tasks, "Tasks retrieved (API v2 - Enhanced URI Versioning)"));
    }

    // =================================================================
    // 2. HEADER VERSIONING (Header: X-API-VERSION=1 or 2)
    // =================================================================

    @GetMapping(value = "/api/tasks", headers = "X-API-VERSION=2")
    @Operation(summary = "Get tasks (Header Versioning v2)", description = "Dispatched via HTTP header 'X-API-VERSION: 2'.")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getTasksHeaderV2(HttpServletRequest request) {
        Long userId = resolveUserId(request);
        List<TaskDTO> tasks = taskService.getTasksByUserId(userId);
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(tasks, "Tasks retrieved via Header Versioning (X-API-VERSION: 2)"));
    }

    // =================================================================
    // 3. PARAMETER VERSIONING (?version=1 or ?version=2)
    // =================================================================

    @GetMapping(value = "/api/tasks", params = "version=2")
    @Operation(summary = "Get tasks (Parameter Versioning v2)", description = "Dispatched via query parameter '?version=2'.")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getTasksParamV2(HttpServletRequest request) {
        Long userId = resolveUserId(request);
        List<TaskDTO> tasks = taskService.getTasksByUserId(userId);
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(tasks, "Tasks retrieved via Parameter Versioning (?version=2)"));
    }

    // =================================================================
    // CRUD OPERATIONS DEMONSTRATING ALL HTTP METHODS
    // =================================================================

    @GetMapping({"/api/tasks/{id}", "/api/v1/tasks/{id}"})
    @Operation(summary = "HTTP GET: Get single task by ID")
    @ApiResponse(responseCode = "200", description = "Task found")
    @ApiResponse(responseCode = "404", description = "Task not found")
    public ResponseEntity<ApiResponseDTO<TaskDTO>> getTaskById(@PathVariable Long id, HttpServletRequest request) {
        Long userId = resolveUserId(request);
        TaskDTO task = taskService.getTaskById(userId, id);
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(task, "Task retrieved"));
    }

    @PostMapping(value = {"/api/tasks", "/api/v1/tasks"}, consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    @Operation(summary = "HTTP POST: Create new task")
    @ApiResponse(responseCode = "201", description = "Task created successfully")
    @ApiResponse(responseCode = "400", description = "Validation error")
    public ResponseEntity<ApiResponseDTO<TaskDTO>> createTask(@Valid @RequestBody TaskDTO.CreateRequest body, HttpServletRequest request) {
        Long userId = resolveUserId(request);
        TaskDTO created = taskService.createTask(userId, body);
        return new ResponseEntity<>(ApiResponseDTO.ofSuccess(created, "Task created successfully"), HttpStatus.CREATED);
    }

    @PutMapping(value = {"/api/tasks/{id}", "/api/v1/tasks/{id}"}, consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    @Operation(summary = "HTTP PUT: Full update of task")
    public ResponseEntity<ApiResponseDTO<TaskDTO>> updateTaskFull(@PathVariable Long id,
                                                                  @Valid @RequestBody TaskDTO.UpdateRequest body,
                                                                  HttpServletRequest request) {
        Long userId = resolveUserId(request);
        TaskDTO updated = taskService.updateTask(userId, id, body);
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(updated, "Task updated (PUT full update)"));
    }

    @PatchMapping(value = {"/api/tasks/{id}", "/api/v1/tasks/{id}"}, consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    @Operation(summary = "HTTP PATCH: Partial update of task attributes")
    public ResponseEntity<ApiResponseDTO<TaskDTO>> patchTask(@PathVariable Long id,
                                                             @RequestBody TaskDTO.UpdateRequest body,
                                                             HttpServletRequest request) {
        Long userId = resolveUserId(request);
        TaskDTO updated = taskService.updateTask(userId, id, body);
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(updated, "Task partially updated (PATCH)"));
    }

    @PatchMapping({"/api/tasks/{id}/toggle", "/api/v1/tasks/{id}/toggle"})
    @Operation(summary = "HTTP PATCH: Toggle task completion status")
    public ResponseEntity<ApiResponseDTO<TaskDTO>> toggleComplete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = resolveUserId(request);
        TaskDTO updated = taskService.toggleComplete(userId, id);
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(updated, "Task completion state toggled"));
    }

    @DeleteMapping({"/api/tasks/{id}", "/api/v1/tasks/{id}"})
    @Operation(summary = "HTTP DELETE: Delete task by ID")
    @ApiResponse(responseCode = "204", description = "Task deleted, NO CONTENT returned")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, HttpServletRequest request) {
        Long userId = resolveUserId(request);
        taskService.deleteTask(userId, id);
        return ResponseEntity.noContent().build(); // HTTP 204 NO CONTENT
    }
}
