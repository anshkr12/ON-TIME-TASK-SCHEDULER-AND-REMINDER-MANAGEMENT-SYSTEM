<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isErrorPage="true"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%-- 
  Module 2 Demonstration:
  - Custom JSP Error Page
  - page directive with isErrorPage="true"
  - Implicit object: exception
--%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Error - ON TIME Task Scheduler</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #fff1f2; color: #881337; margin: 0; padding: 2rem; }
        .error-card { max-width: 650px; margin: 3rem auto; background: white; border: 1px solid #fecdd3; border-radius: 12px; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        h1 { margin-top: 0; font-size: 1.5rem; color: #be123c; }
        code { background: #fecdd3; padding: 2px 6px; border-radius: 4px; font-size: 0.9rem; }
        pre { background: #1e293b; color: #f8fafc; padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.8rem; }
        .btn { display: inline-block; padding: 0.6rem 1.2rem; background: #be123c; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 1rem; }
    </style>
</head>
<body>

    <div class="error-card">
        <h1>Module 2: Custom JSP Error Page</h1>
        <p>A handled exception occurred during request execution. The system caught this error using the JSP Error Page mechanism (<code>isErrorPage="true"</code>).</p>

        <p><b>HTTP Status Code:</b> <code><%= pageContext.getErrorData() != null ? pageContext.getErrorData().getStatusCode() : "500" %></code></p>
        <p><b>Request URI:</b> <code><%= pageContext.getErrorData() != null ? pageContext.getErrorData().getRequestURI() : request.getRequestURI() %></code></p>
        <p><b>Exception Message:</b> <%= exception != null ? exception.getMessage() : (request.getAttribute("jakarta.servlet.error.message") != null ? request.getAttribute("jakarta.servlet.error.message") : "Internal Server Error") %></p>

        <% if (exception != null) { %>
            <h3>Stack Trace (Implicit Object: exception)</h3>
            <pre><%
                java.io.StringWriter sw = new java.io.StringWriter();
                java.io.PrintWriter pw = new java.io.PrintWriter(sw);
                exception.printStackTrace(pw);
                out.print(sw.toString());
            %></pre>
        <% } %>

        <a href="${pageContext.request.contextPath}/dashboard" class="btn">&larr; Return to Safe Dashboard</a>
    </div>

</body>
</html>
