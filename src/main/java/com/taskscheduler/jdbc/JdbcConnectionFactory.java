package com.taskscheduler.jdbc;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Raw JDBC Demonstrator.
 * Fulfills Module 1 Requirements:
 * - JDBC Driver loading
 * - Database Connectivity (DriverManager.getConnection)
 * - java.sql.Connection
 * - java.sql.Statement
 * - java.sql.PreparedStatement
 * - java.sql.ResultSet
 * - Transaction Management (setAutoCommit(false), commit, rollback)
 * - Stored Procedures (CallableStatement)
 */
@Component
public class JdbcConnectionFactory {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String driverClassName;

    /**
     * Demonstrates Driver Loading and Connection creation
     */
    public Connection getConnection() throws SQLException, ClassNotFoundException {
        Class.forName(driverClassName);
        return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
    }

    /**
     * Demonstrates Statement and ResultSet
     */
    public List<Map<String, Object>> executeSimpleStatementQuery(String sql) throws SQLException, ClassNotFoundException {
        List<Map<String, Object>> results = new ArrayList<>();
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            ResultSetMetaData meta = rs.getMetaData();
            int columnCount = meta.getColumnCount();

            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    row.put(meta.getColumnLabel(i), rs.getObject(i));
                }
                results.add(row);
            }
        }
        return results;
    }

    /**
     * Demonstrates PreparedStatement and parameterized query
     */
    public List<Map<String, Object>> executePreparedStatementQuery(String sql, Object... params) throws SQLException, ClassNotFoundException {
        List<Map<String, Object>> results = new ArrayList<>();
        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            for (int i = 0; i < params.length; i++) {
                pstmt.setObject(i + 1, params[i]);
            }

            try (ResultSet rs = pstmt.executeQuery()) {
                ResultSetMetaData meta = rs.getMetaData();
                int columnCount = meta.getColumnCount();
                while (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    for (int i = 1; i <= columnCount; i++) {
                        row.put(meta.getColumnLabel(i), rs.getObject(i));
                    }
                    results.add(row);
                }
            }
        }
        return results;
    }

    /**
     * Demonstrates Transaction Management (ACID: setAutoCommit(false), commit, rollback)
     */
    public boolean executeTransactionDemo(Long userId, String taskTitle, String reminderMsg) {
        Connection conn = null;
        PreparedStatement insertTaskStmt = null;
        PreparedStatement insertReminderStmt = null;

        try {
            conn = getConnection();
            // Step 1: Begin manual transaction
            conn.setAutoCommit(false);

            // Step 2: Insert Task using PreparedStatement
            String insertTaskSql = "INSERT INTO tasks (user_id, title, deadline, completed, status, priority, category) VALUES (?, ?, NOW(), false, 'TODO', 'HIGH', 'Work')";
            insertTaskStmt = conn.prepareStatement(insertTaskSql, Statement.RETURN_GENERATED_KEYS);
            insertTaskStmt.setLong(1, userId);
            insertTaskStmt.setString(2, taskTitle);
            insertTaskStmt.executeUpdate();

            // Retrieve generated Task ID
            long generatedTaskId = 0;
            try (ResultSet generatedKeys = insertTaskStmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    generatedTaskId = generatedKeys.getLong(1);
                } else {
                    throw new SQLException("Failed to obtain generated task id, rolling back.");
                }
            }

            // Step 3: Insert associated Reminder
            String insertReminderSql = "INSERT INTO reminders (task_id, user_id, reminder_time, reminder_message, status) VALUES (?, ?, NOW(), ?, 'PENDING')";
            insertReminderStmt = conn.prepareStatement(insertReminderSql);
            insertReminderStmt.setLong(1, generatedTaskId);
            insertReminderStmt.setLong(2, userId);
            insertReminderStmt.setString(3, reminderMsg);
            insertReminderStmt.executeUpdate();

            // Step 4: Commit transaction
            conn.commit();
            return true;

        } catch (Exception e) {
            // Step 5: Rollback on failure
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            e.printStackTrace();
            return false;
        } finally {
            // Step 6: Close resources safely
            try {
                if (insertTaskStmt != null) insertTaskStmt.close();
                if (insertReminderStmt != null) insertReminderStmt.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Demonstrates Stored Procedure execution using CallableStatement
     */
    public Map<String, Integer> executeStoredProcedure(Long userId) throws SQLException, ClassNotFoundException {
        Map<String, Integer> summary = new HashMap<>();
        String callSql = "{call sp_get_user_task_summary(?, ?, ?, ?)}";

        try (Connection conn = getConnection();
             CallableStatement cstmt = conn.prepareCall(callSql)) {

            // Register IN parameter
            cstmt.setLong(1, userId);

            // Register OUT parameters
            cstmt.registerOutParameter(2, Types.INTEGER);
            cstmt.registerOutParameter(3, Types.INTEGER);
            cstmt.registerOutParameter(4, Types.INTEGER);

            // Execute stored procedure
            cstmt.execute();

            // Retrieve OUT parameters
            summary.put("totalTasks", cstmt.getInt(2));
            summary.put("completedTasks", cstmt.getInt(3));
            summary.put("pendingReminders", cstmt.getInt(4));
        }
        return summary;
    }
}
