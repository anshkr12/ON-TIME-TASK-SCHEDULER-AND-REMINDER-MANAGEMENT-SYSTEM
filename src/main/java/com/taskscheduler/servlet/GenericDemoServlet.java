package com.taskscheduler.servlet;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;

/**
 * GenericServlet Demonstration.
 * Fulfills Module 1 Requirement: "GenericServlet Example".
 * Implements protocol-independent servlet handling via javax/jakarta.servlet.GenericServlet.
 */
@WebServlet(name = "GenericDemoServlet", urlPatterns = "/servlet/generic-demo")
public class GenericDemoServlet extends GenericServlet {

    private String servletInitMessage;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        servletInitMessage = "GenericServlet initialized successfully via init(ServletConfig)";
    }

    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        res.setContentType("text/html;charset=UTF-8");
        PrintWriter out = res.getWriter();

        out.println("<!DOCTYPE html>");
        out.println("<html><head><title>GenericServlet Demo</title>");
        out.println("<style>body{font-family:sans-serif;margin:2rem;line-height:1.6;background:#f8fafc;color:#1e293b;}</style>");
        out.println("</head><body>");
        out.println("<h2>Module 1: GenericServlet Implementation</h2>");
        out.println("<p><b>Servlet Name:</b> " + getServletName() + "</p>");
        out.println("<p><b>Init Message:</b> " + servletInitMessage + "</p>");
        out.println("<p><b>Protocol:</b> " + req.getProtocol() + "</p>");
        out.println("<p><b>Server Time:</b> " + LocalDateTime.now() + "</p>");
        out.println("<p><i>Note: GenericServlet defines a protocol-independent servlet. It requires overriding service(ServletRequest, ServletResponse).</i></p>");
        out.println("<p><a href='/'>&larr; Return to Application</a></p>");
        out.println("</body></html>");
    }

    @Override
    public void destroy() {
        // Lifecycle destroy method
        super.destroy();
    }
}
