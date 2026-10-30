<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - ON TIME Task Scheduler</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; }
        .main-wrapper { max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem; }
        .grid-kpi { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
        .card-kpi { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .kpi-title { font-size: 0.8rem; text-transform: uppercase; color: #64748b; font-weight: 600; margin: 0 0 0.5rem; }
        .kpi-value { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin: 0; }
        .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .badge-high { background: #fee2e2; color: #991b1b; }
        .badge-med { background: #fef3c7; color: #92400e; }
        .badge-low { background: #dcfce7; color: #166534; }
        .badge-done { background: #dbeafe; color: #1e40af; }
        .badge-todo { background: #f1f5f9; color: #475569; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { text-align: left; padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; font-size: 0.875rem; }
        th { background: #f1f5f9; color: #475569; font-weight: 600; }
        .section-box { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    </style>
</head>
<body>

    <%@ include file="header.jspf" %>

    <div class="main-wrapper">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem;">
            <div>
                <h2 style="margin: 0; font-size: 1.6rem; color: #0f172a;">Overview Dashboard</h2>
                <p style="margin: 0.25rem 0 0; color: #64748b; font-size: 0.9rem;">
                    Welcome back, <b>${currentUserName}</b>! Real-time task execution and reminder analytics.
                </p>
            </div>
            <div style="display: flex; gap: 0.75rem;">
                <a href="${pageContext.request.contextPath}/tasks/view" style="background: #2563eb; color: white; padding: 0.6rem 1.2rem; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">+ Manage Tasks</a>
                <a href="${pageContext.request.contextPath}/api/reports/statistics" target="_blank" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 0.6rem 1.2rem; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">Spring JDBC JSON</a>
            </div>
        </div>

        <!-- KPI Grid using Expression Language (EL) -->
        <div class="grid-kpi">
            <div class="card-kpi">
                <p class="kpi-title">Total Tasks</p>
                <p class="kpi-value">${stats.totalTasks}</p>
            </div>
            <div class="card-kpi">
                <p class="kpi-title">Completed Tasks</p>
                <p class="kpi-value" style="color: #16a34a;">${stats.completedTasks}</p>
            </div>
            <div class="card-kpi">
                <p class="kpi-title">Pending / In Progress</p>
                <p class="kpi-value" style="color: #d97706;">${stats.pendingTasks}</p>
            </div>
            <div class="card-kpi">
                <p class="kpi-title">Completion Rate</p>
                <p class="kpi-value" style="color: #2563eb;">${stats.completionRate}%</p>
            </div>
        </div>

        <!-- Task List using JSTL <c:forEach> -->
        <div class="section-box">
            <h3 style="margin-top: 0; font-size: 1.15rem; color: #0f172a;">Active Scheduled Tasks (Spring Data JPA)</h3>
            <c:choose>
                <c:when test="${not empty tasks}">
                    <table>
                        <thead>
                            <tr>
                                <th>Task Title</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Deadline</th>
                            </tr>
                        </thead>
                        <tbody>
                            <c:forEach var="task" items="${tasks}">
                                <tr>
                                    <td>
                                        <b style="color: #1e293b;">${task.title}</b>
                                        <c:if test="${not empty task.description}">
                                            <div style="font-size: 0.75rem; color: #64748b;">${task.description}</div>
                                        </c:if>
                                    </td>
                                    <td>${task.category}</td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${task.priority == 'HIGH'}"><span class="badge badge-high">HIGH</span></c:when>
                                            <c:when test="${task.priority == 'MEDIUM'}"><span class="badge badge-med">MEDIUM</span></c:when>
                                            <c:otherwise><span class="badge badge-low">LOW</span></c:otherwise>
                                        </c:choose>
                                    </td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${task.completed}"><span class="badge badge-done">&#10003; DONE</span></c:when>
                                            <c:otherwise><span class="badge badge-todo">${task.status}</span></c:otherwise>
                                        </c:choose>
                                    </td>
                                    <td>${task.deadline}</td>
                                </tr>
                            </c:forEach>
                        </tbody>
                    </table>
                </c:when>
                <c:otherwise>
                    <p style="color: #64748b; font-size: 0.9rem;">No tasks scheduled yet. Click '+ Manage Tasks' to add your first task.</p>
                </c:otherwise>
            </c:choose>
        </div>

        <!-- Spring JDBC Integration Showcase (Module 3 & 4 Requirement) -->
        <div class="section-box">
            <h3 style="margin-top: 0; font-size: 1.15rem; color: #0f172a;">Spring JDBC (JdbcTemplate) Aggregation Report</h3>
            <p style="color: #64748b; font-size: 0.85rem; margin-top: -0.25rem;">
                Demonstrates Spring JDBC <code>JdbcTemplate</code> query execution with grouping and SQL aggregates instead of JPA.
            </p>
            <c:choose>
                <c:when test="${not empty jdbcSummaryReport}">
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Total Assigned</th>
                                <th>Completed</th>
                                <th>Overdue</th>
                            </tr>
                        </thead>
                        <tbody>
                            <c:forEach var="row" items="${jdbcSummaryReport}">
                                <tr>
                                    <td><b>${row.category}</b></td>
                                    <td>${row.priority}</td>
                                    <td>${row.total_count}</td>
                                    <td><span style="color: #16a34a; font-weight: bold;">${row.completed_count}</span></td>
                                    <td><span style="color: #dc2626; font-weight: bold;">${row.overdue_count}</span></td>
                                </tr>
                            </c:forEach>
                        </tbody>
                    </table>
                </c:when>
                <c:otherwise>
                    <p style="color: #64748b; font-size: 0.9rem;">Spring JDBC report will populate automatically as tasks are scheduled.</p>
                </c:otherwise>
            </c:choose>
        </div>
    </div>

    <%@ include file="footer.jspf" %>

</body>
</html>
