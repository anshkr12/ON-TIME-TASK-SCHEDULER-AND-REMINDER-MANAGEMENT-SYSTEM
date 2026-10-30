<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - ON TIME Task Scheduler</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; }
        .auth-container { max-width: 460px; margin: 3rem auto; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); padding: 2rem; }
        .form-group { margin-bottom: 1.25rem; }
        label { display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.35rem; }
        input[type="text"], input[type="email"], input[type="password"] { width: 100%; box-sizing: border-box; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
        .btn-primary { width: 100%; padding: 0.75rem; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .btn-primary:hover { background: #1d4ed8; }
        .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
    </style>
</head>
<body>

    <%@ include file="header.jspf" %>

    <div class="auth-container">
        <h2 style="margin-top:0; font-size: 1.35rem; color: #1e3a8a;">Create an ON TIME Account</h2>
        <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem;">Join to organize tasks and manage automated reminders.</p>

        <c:if test="${not empty errorMessage}">
            <div class="alert-error">${errorMessage}</div>
        </c:if>

        <form action="${pageContext.request.contextPath}/register" method="POST">
            <div class="form-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="fullName" name="fullName" value="${registerForm.fullName}" required placeholder="e.g. Jordan Smith" />
            </div>

            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" value="${registerForm.email}" required placeholder="name@example.com" />
            </div>

            <div class="form-group">
                <label for="password">Password (minimum 6 characters)</label>
                <input type="password" id="password" name="password" required minlength="6" />
            </div>

            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6" />
            </div>

            <button type="submit" class="btn-primary">Register Account</button>
        </form>

        <p style="text-align: center; margin-top: 1.25rem; font-size: 0.875rem;">
            Already have an account? <a href="${pageContext.request.contextPath}/login" style="color: #2563eb; font-weight: 600; text-decoration: none;">Sign In</a>
        </p>
    </div>

    <%@ include file="footer.jspf" %>

</body>
</html>
