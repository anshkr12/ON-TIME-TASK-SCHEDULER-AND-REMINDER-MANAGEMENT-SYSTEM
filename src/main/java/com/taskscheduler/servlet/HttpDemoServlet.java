package com.taskscheduler.servlet;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;

/**
 * HttpServlet Demonstration.
 * Fulfills Module 1 Requirement: "HttpServlet Example" & Servlet Life Cycle.
 * Demonstrates:
 * - init()
 * - doGet()
 * - doPost()
 * - destroy()
 */
@WebServlet(name = "HttpDemoServlet", urlPatterns = "/servlet/http-demo")
public class HttpDemoServlet extends HttpServlet {

    private long requestCounter = 0;
    private LocalDateTime initializedAt;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        initializedAt = LocalDateTime.now();
        System.out.println("[HttpDemoServlet] Servlet Lifecycle: init() executed at " + initializedAt);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        synchronized (this) {
            requestCounter++;
        }

        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        out.println("<!DOCTYPE html>");
        out.println("<html><head><title>HttpServlet Demo</title>");
        out.println("<style>body{font-family:sans-serif;margin:2rem;line-height:1.6;background:#f8fafc;color:#1e293b;} table{border-collapse:collapse;width:100%;max-width:600px;} td,th{border:1px solid #cbd5e1;padding:8px;}</style>");
        out.println("</head><body>");
        out.println("<h2>Module 1: HttpServlet Lifecycle Demonstration</h2>");
        out.println("<table>");
        out.println("<tr><th>Lifecycle Phase</th><th>Status / Value</th></tr>");
        out.println("<tr><td>init()</td><td>Completed at " + initializedAt + "</td></tr>");
        out.println("<tr><td>service() &rarr; doGet()</td><td>Active (Request #" + requestCounter + ")</td></tr>");
        out.println("<tr><td>Request Method</td><td>" + req.getMethod() + "</td></tr>");
        out.println("<tr><td>Context Path</td><td>" + req.getContextPath() + "</td></tr>");
        out.println("<tr><td>User-Agent</td><td>" + req.getHeader("User-Agent") + "</td></tr>");
        out.println("</table>");

        out.println("<h3 style='margin-top:20px;'>Test doPost() Form Submission</h3>");
        out.println("<form method='POST' action='" + req.getContextPath() + "/servlet/http-demo'>");
        out.println("<input type='text' name='taskSample' placeholder='Enter quick task title...' style='padding:8px;width:250px;' required /> ");
        out.println("<button type='submit' style='padding:8px 16px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;'>Submit via doPost()</button>");
        out.println("</form>");

        out.println("<p style='margin-top:20px;'><a href='/'>&larr; Return to Dashboard</a></p>");
        out.println("</body></html>");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String taskSample = req.getParameter("taskSample");
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        out.println("<!DOCTYPE html>");
        out.println("<html><head><title>HttpServlet doPost() Result</title>");
        out.println("<style>body{font-family:sans-serif;margin:2rem;line-height:1.6;background:#f8fafc;color:#1e293b;}</style>");
        out.println("</head><body>");
        out.println("<h2>Module 1: HttpServlet doPost() Executed</h2>");
        out.println("<p style='color:#16a34a;font-weight:bold;'>Data successfully processed via HttpServlet.doPost()</p>");
        out.println("<p><b>Received Parameter [taskSample]:</b> " + taskSample + "</p>");
        out.println("<p><a href='" + req.getContextPath() + "/servlet/http-demo'>Back to doGet() Form</a> | <a href='/'>Return Home</a></p>");
        out.println("</body></html>");
    }

    @Override
    public void destroy() {
        System.out.println("[HttpDemoServlet] Servlet Lifecycle: destroy() invoked.");
        super.destroy();
    }
}
