<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<%-- 
  Module 2 Demonstration:
  1. JSP Scripting Elements:
     - Declaration: <%! %>
     - Scriptlet: <% %>
     - Expression: <%= %>
  2. JSP Implicit Objects: request, response, session, application, pageContext, out
  3. JSP Directives: page, include, taglib
  4. Expression Language (EL)
--%>

<%! 
    // JSP Declaration Element: defines methods or class members in generated servlet class
    private String formatSystemWelcome(String appName) {
        return "Welcome to " + appName + " Authentication Portal";
    }
%>

<%
    // JSP Scriptlet Element: Java statements executed on each page request
    String pageTitle = "Sign In - ON TIME Task Scheduler";
    String applicationName = application.getInitParameter("appName");
    if (applicationName == null) {
        applicationName = "ON TIME";
    }
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= pageTitle %></title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; }
        .auth-container { max-width: 420px; margin: 3rem auto; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); padding: 2rem; }
        .form-group { margin-bottom: 1.25rem; }
        label { display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.35rem; }
        input[type="text"], input[type="email"], input[type="password"] { width: 100%; box-sizing: border-box; padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
        .btn-primary { width: 100%; padding: 0.75rem; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .btn-primary:hover { background: #1d4ed8; }
        .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
        .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
        .demo-box { background: #f1f5f9; border: 1px dashed #94a3b8; border-radius: 6px; padding: 0.75rem; margin-top: 1.5rem; font-size: 0.8rem; }
    </style>
</head>
<body>

    <!-- Include Header Directive -->
    <%@ include file="header.jspf" %>

    <div class="auth-container">
        <!-- JSP Expression Element output -->
        <h2 style="margin-top:0; font-size: 1.35rem; color: #1e3a8a;"><%= formatSystemWelcome(applicationName) %></h2>
        <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem;">Enter your credentials to access the scheduler dashboard.</p>

        <!-- Display error/success messages using Expression Language (EL) -->
        <c:if test="${not empty errorMessage}">
            <div class="alert-error">${errorMessage}</div>
        </c:if>
        <c:if test="${not empty successMessage}">
            <div class="alert-success">${successMessage}</div>
        </c:if>

        <form action="${pageContext.request.contextPath}/login" method="POST">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" value="${loginForm.email != null ? loginForm.email : 'user@example.com'}" required autocomplete="email" />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" value="Password123" required autocomplete="current-password" />
            </div>

            <button type="submit" class="btn-primary">Sign In</button>
        </form>

        <p style="text-align: center; margin-top: 1.25rem; font-size: 0.875rem;">
            Don't have an account? <a href="${pageContext.request.contextPath}/register" style="color: #2563eb; font-weight: 600; text-decoration: none;">Create Account</a>
        </p>

        <!-- Module 2 Technical Verification Box demonstrating Implicit Objects -->
        <div class="demo-box">
            <b>JSP Implicit Objects Verified on this page:</b>
            <ul style="margin: 0.35rem 0 0; padding-left: 1.25rem;">
                <li><code>request.getMethod()</code>: <%= request.getMethod() %></li>
                <li><code>session.getId()</code>: <%= session.getId() %></li>
                <li><code>pageContext.getRequest().getServerName()</code>: <%= pageContext.getRequest().getServerName() %></li>
                <li><code>application.getServerInfo()</code>: <%= application.getServerInfo() %></li>
            </ul>
        </div>
    </div>

    <!-- Include Footer Directive -->
    <%@ include file="footer.jspf" %>

</body>
</html>
