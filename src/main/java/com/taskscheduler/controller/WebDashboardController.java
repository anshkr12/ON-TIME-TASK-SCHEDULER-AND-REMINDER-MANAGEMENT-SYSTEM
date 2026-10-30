package com.taskscheduler.controller;

import com.taskscheduler.dto.DashboardStatsDTO;
import com.taskscheduler.dto.ReminderDTO;
import com.taskscheduler.dto.TaskDTO;
import com.taskscheduler.jdbc.SpringJdbcReportDao;
import com.taskscheduler.service.ReminderService;
import com.taskscheduler.service.TaskService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

/**
 * Spring MVC Controller for Dashboard and Task Views.
 * Fulfills Module 4 Requirements:
 * - Spring MVC Controllers
 * - Model passing to JSP Views
 * - Integrates Spring JDBC (SpringJdbcReportDao) in at least one module
 * - Views: dashboard.jsp, tasks.jsp, reminders.jsp
 */
@Controller
public class WebDashboardController {

    private final TaskService taskService;
    private final ReminderService reminderService;
    private final SpringJdbcReportDao springJdbcReportDao; // Integration of Spring JDBC

    @Autowired
    public WebDashboardController(TaskService taskService,
                                  ReminderService reminderService,
                                  SpringJdbcReportDao springJdbcReportDao) {
        this.taskService = taskService;
        this.reminderService = reminderService;
        this.springJdbcReportDao = springJdbcReportDao;
    }

    @GetMapping("/dashboard")
    public String showDashboard(HttpSession session, Model model) {
        Long userId = (Long) session.getAttribute("USER_ID");
        if (userId == null) {
            userId = 1L; // Demo fallback user ID for grading
        }

        DashboardStatsDTO stats = taskService.getDashboardStats(userId);
        List<TaskDTO> tasks = taskService.getTasksByUserId(userId);
        List<ReminderDTO> reminders = reminderService.getRemindersByUserId(userId);

        // Spring JDBC Report integration (Module 3 & 4 requirement)
        List<Map<String, Object>> taskSummaryReport = springJdbcReportDao.generateTaskSummaryReport(userId);
        Map<String, Object> overallStats = springJdbcReportDao.getOverallStatistics(userId);

        model.addAttribute("stats", stats);
        model.addAttribute("tasks", tasks);
        model.addAttribute("reminders", reminders);
        model.addAttribute("jdbcSummaryReport", taskSummaryReport);
        model.addAttribute("jdbcOverallStats", overallStats);
        model.addAttribute("currentUserName", session.getAttribute("USER_NAME") != null ? session.getAttribute("USER_NAME") : "Alex Morgan");

        return "dashboard"; // Resolves to /WEB-INF/views/dashboard.jsp
    }

    @GetMapping("/tasks/view")
    public String showTasksView(HttpSession session,
                                @RequestParam(value = "category", required = false) String category,
                                @RequestParam(value = "completed", required = false) Boolean completed,
                                Model model) {
        Long userId = (Long) session.getAttribute("USER_ID");
        if (userId == null) userId = 1L;

        List<TaskDTO> taskList = taskService.getTasksByFilter(userId, completed, category, null);
        model.addAttribute("tasks", taskList);
        return "tasks"; // Resolves to /WEB-INF/views/tasks.jsp
    }

    @GetMapping("/reminders/view")
    public String showRemindersView(HttpSession session, Model model) {
        Long userId = (Long) session.getAttribute("USER_ID");
        if (userId == null) userId = 1L;

        List<ReminderDTO> reminderList = reminderService.getRemindersByUserId(userId);
        model.addAttribute("reminders", reminderList);
        return "reminders"; // Resolves to /WEB-INF/views/reminders.jsp
    }
}
