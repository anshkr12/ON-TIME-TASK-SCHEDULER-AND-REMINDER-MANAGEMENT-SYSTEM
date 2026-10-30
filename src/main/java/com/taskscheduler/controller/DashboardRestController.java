package com.taskscheduler.controller;

import com.taskscheduler.dto.ApiResponseDTO;
import com.taskscheduler.dto.DashboardStatsDTO;
import com.taskscheduler.jdbc.JdbcConnectionFactory;
import com.taskscheduler.jdbc.SpringJdbcReportDao;
import com.taskscheduler.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Dashboard & Reports REST Controller.
 * Integrates:
 * - High-level JPA analytics
 * - Spring JDBC JdbcTemplate reports & user search (Module 3)
 * - Raw JDBC transaction and stored procedure triggers (Module 1)
 */
@RestController
@Tag(name = "Dashboard & Analytics APIs", description = "Endpoints for KPI stats, Spring JDBC reports, and Raw JDBC execution")
public class DashboardRestController {

    private final TaskService taskService;
    private final SpringJdbcReportDao springJdbcReportDao;
    private final JdbcConnectionFactory jdbcConnectionFactory;

    @Autowired
    public DashboardRestController(TaskService taskService,
                                   SpringJdbcReportDao springJdbcReportDao,
                                   JdbcConnectionFactory jdbcConnectionFactory) {
        this.taskService = taskService;
        this.springJdbcReportDao = springJdbcReportDao;
        this.jdbcConnectionFactory = jdbcConnectionFactory;
    }

    private Long resolveUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("USER_ID") != null) {
            return (Long) session.getAttribute("USER_ID");
        }
        return 1L;
    }

    @GetMapping(value = "/api/dashboard/stats", produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    @Operation(summary = "Get Dashboard KPI Metrics")
    public ResponseEntity<ApiResponseDTO<DashboardStatsDTO>> getStats(HttpServletRequest request) {
        Long userId = resolveUserId(request);
        DashboardStatsDTO stats = taskService.getDashboardStats(userId);
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(stats, "Dashboard statistics computed"));
    }

    @GetMapping(value = "/api/reports/statistics", produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    @Operation(summary = "Module 3: Spring JDBC Statistics using JdbcTemplate")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getJdbcStatistics(HttpServletRequest request) {
        Long userId = resolveUserId(request);
        Map<String, Object> stats = springJdbcReportDao.getOverallStatistics(userId);
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(stats, "Statistics generated via Spring JDBC (JdbcTemplate)"));
    }

    @GetMapping(value = "/api/reports/search-users", produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    @Operation(summary = "Module 3: Spring JDBC User Search using JdbcTemplate and RowMapper")
    public ResponseEntity<ApiResponseDTO<List<Map<String, Object>>>> searchUsers(@RequestParam(defaultValue = "") String keyword) {
        List<Map<String, Object>> users = springJdbcReportDao.searchUsersByKeyword(keyword);
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(users, "User search executed via Spring JDBC (JdbcTemplate)"));
    }

    @GetMapping(value = "/api/reports/raw-jdbc-transaction", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Module 1: Raw JDBC Transaction Management demonstration")
    public ResponseEntity<ApiResponseDTO<String>> testTransaction(HttpServletRequest request) {
        Long userId = resolveUserId(request);
        boolean success = jdbcConnectionFactory.executeTransactionDemo(
                userId,
                "Demo Task via JDBC Transaction " + System.currentTimeMillis(),
                "Demo Reminder via JDBC Transaction"
        );
        return ResponseEntity.ok(ApiResponseDTO.ofSuccess(
                success ? "Transaction committed successfully (ACID compliant)" : "Transaction rolled back on error",
                "Raw JDBC Transaction Test"
        ));
    }

    @GetMapping(value = "/api/reports/stored-procedure", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Module 1: Raw JDBC Stored Procedure CallableStatement demonstration")
    public ResponseEntity<ApiResponseDTO<Map<String, Integer>>> testStoredProcedure(HttpServletRequest request) {
        Long userId = resolveUserId(request);
        try {
            Map<String, Integer> summary = jdbcConnectionFactory.executeStoredProcedure(userId);
            return ResponseEntity.ok(ApiResponseDTO.ofSuccess(summary, "Stored procedure sp_get_user_task_summary executed"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.ofError("Stored procedure demo note: " + e.getMessage()));
        }
    }
}
