package com.taskscheduler.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/**
 * Demonstrates:
 * - Module 1 Requirement 5: response.sendRedirect()
 * Illustrates client-side redirection (HTTP 302 Found) vs server-side forwarding.
 */
@WebServlet(name = "RedirectDemoServlet", urlPatterns = "/servlet/redirect-demo")
public class RedirectDemoServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String target = req.getParameter("target");

        if ("dashboard".equalsIgnoreCase(target)) {
            // Client-side redirect to dashboard
            resp.sendRedirect(req.getContextPath() + "/dashboard");
            return;
        }

        // Perform redirect with flash query parameter
        resp.sendRedirect(req.getContextPath() + "/servlet/http-demo?redirectSource=RedirectDemoServlet");
    }
}
