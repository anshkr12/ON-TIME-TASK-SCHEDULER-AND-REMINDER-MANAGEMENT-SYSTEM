package com.taskscheduler.jdbc;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Spring JDBC Data Access Object using JdbcTemplate.
 * Fulfills Module 3 Requirements:
 * - Spring JDBC module accessing database using JdbcTemplate instead of JPA
 * - Practical Examples:
 *   1. User Search (parameterized query with RowMapper)
 *   2. Report Generation (complex aggregation query)
 *   3. Statistics (count and grouping queries)
 */
@Repository
public class SpringJdbcReportDao {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public SpringJdbcReportDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Example 1: User Search using JdbcTemplate and RowMapper
     */
    public List<Map<String, Object>> searchUsersByKeyword(String keyword) {
        String sql = "SELECT id, full_name, email, enabled, created_at FROM users " +
                     "WHERE LOWER(full_name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?)";
        String pattern = "%" + keyword + "%";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", rs.getLong("id"));
            map.put("fullName", rs.getString("full_name"));
            map.put("email", rs.getString("email"));
            map.put("enabled", rs.getBoolean("enabled"));
            map.put("createdAt", rs.getTimestamp("created_at"));
            return map;
        }, pattern, pattern);
    }

    /**
     * Example 2: Report Generation (Aggregated task report across categories and priorities)
     */
    public List<Map<String, Object>> generateTaskSummaryReport(Long userId) {
        String sql = "SELECT category, priority, COUNT(*) AS total_count, " +
                     "SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) AS completed_count, " +
                     "SUM(CASE WHEN completed = FALSE AND deadline < CURRENT_TIMESTAMP THEN 1 ELSE 0 END) AS overdue_count " +
                     "FROM tasks WHERE user_id = ? " +
                     "GROUP BY category, priority ORDER BY category ASC, priority ASC";

        return jdbcTemplate.queryForList(sql, userId);
    }

    /**
     * Example 3: Productivity Statistics (Overall system and user KPI metrics)
     */
    public Map<String, Object> getOverallStatistics(Long userId) {
        String sql = "SELECT " +
                     "  (SELECT COUNT(*) FROM tasks WHERE user_id = ?) AS total_tasks, " +
                     "  (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND completed = TRUE) AS completed_tasks, " +
                     "  (SELECT COUNT(*) FROM reminders WHERE user_id = ? AND status = 'PENDING') AS pending_reminders, " +
                     "  (SELECT COUNT(*) FROM reminders WHERE user_id = ? AND status = 'SENT') AS sent_reminders";

        return jdbcTemplate.queryForMap(sql, userId, userId, userId, userId);
    }
}
