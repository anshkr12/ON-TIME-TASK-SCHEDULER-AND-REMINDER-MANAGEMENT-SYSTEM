<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reminders - ON TIME Task Scheduler</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; }
        .main-wrapper { max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem; }
        .section-box { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { text-align: left; padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; font-size: 0.875rem; }
        th { background: #f1f5f9; color: #475569; font-weight: 600; }
    </style>
</head>
<body>

    <%@ include file="header.jspf" %>

    <div class="main-wrapper">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
                <h2 style="margin: 0; font-size: 1.6rem; color: #0f172a;">Reminders &amp; Alerts</h2>
                <p style="margin: 0.25rem 0 0; color: #64748b; font-size: 0.9rem;">Automated reminders monitored by Spring Boot Background Scheduler</p>
            </div>
            <div>
                <a href="${pageContext.request.contextPath}/dashboard" style="background:#2563eb; color:white; padding:0.5rem 1rem; border-radius:6px; text-decoration:none; font-weight:600; font-size:0.875rem;">&larr; Back to Dashboard</a>
            </div>
        </div>

        <div class="section-box">
            <h3 style="margin-top:0;">Active Reminders (Spring Data CrudRepository)</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Task Reference</th>
                        <th>Reminder Message</th>
                        <th>Alert Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <c:forEach var="rem" items="${reminders}">
                        <tr>
                            <td><code>#${rem.id}</code></td>
                            <td><b>${rem.taskTitle}</b> (Task #${rem.taskId})</td>
                            <td>${rem.reminderMessage}</td>
                            <td>${rem.reminderTime}</td>
                            <td>
                                <span style="background:#e0e7ff; color:#3730a3; padding:2px 8px; border-radius:9999px; font-size:0.75rem; font-weight:600;">
                                    ${rem.status}
                                </span>
                            </td>
                        </tr>
                    </c:forEach>
                </tbody>
            </table>
        </div>
    </div>

    <%@ include file="footer.jspf" %>

</body>
</html>
