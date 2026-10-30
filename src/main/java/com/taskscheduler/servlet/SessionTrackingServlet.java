package com.taskscheduler.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;

/**
 * Session Tracking Demonstration.
 * Fulfills Module 1 Requirements:
 * 1. Cookies (reading and writing javax.servlet.http.Cookie)
 * 2. URL Rewriting (response.encodeURL)
 * 3. HttpSession (session creation, attribute storage, invalidation, timeout)
 * Includes a working login example using session tracking.
 */
@WebServlet(name = "SessionTrackingServlet", urlPatterns = "/servlet/session-tracking")
public class SessionTrackingServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        // 3. HttpSession Implementation
        HttpSession session = req.getSession(true);
        String sessionUser = (String) session.getAttribute("SESSION_USER");
        Integer visitCount = (Integer) session.getAttribute("VISIT_COUNT");
        if (visitCount == null) {
            visitCount = 1;
        } else {
            visitCount++;
        }
        session.setAttribute("VISIT_COUNT", visitCount);

        // 1. Cookies Implementation
        String cookieUser = null;
        Cookie[] cookies = req.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("TRACKING_USER".equals(c.getName())) {
                    cookieUser = c.getValue();
                    break;
                }
            }
        }

        // 2. URL Rewriting Implementation
        String rewrittenUrl = resp.encodeURL(req.getContextPath() + "/servlet/session-tracking?action=refresh");
        String logoutUrl = resp.encodeURL(req.getContextPath() + "/servlet/session-tracking?action=logout");

        String action = req.getParameter("action");
        if ("logout".equalsIgnoreCase(action)) {
            session.invalidate();
            // Clear cookie
            Cookie deleteCookie = new Cookie("TRACKING_USER", "");
            deleteCookie.setMaxAge(0);
            deleteCookie.setPath("/");
            resp.addCookie(deleteCookie);
            resp.sendRedirect(req.getContextPath() + "/servlet/session-tracking");
            return;
        }

        out.println("<!DOCTYPE html><html><head><title>Session Tracking Demonstration</title>");
        out.println("<style>body{font-family:sans-serif;margin:2rem;line-height:1.6;background:#f8fafc;} .card{background:#fff;border:1px solid #cbd5e1;padding:1.5rem;border-radius:8px;max-width:700px;margin-bottom:1.5rem;} table{width:100%;border-collapse:collapse;} td,th{padding:8px;border:1px solid #e2e8f0;} code{background:#f1f5f9;padding:2px 6px;border-radius:4px;}</style>");
        out.println("</head><body>");

        out.println("<h2>Module 1: Complete Session Tracking Demonstration</h2>");
        out.println("<p>This servlet demonstrates all 3 required session tracking techniques in the Java Servlet API.</p>");

        out.println("<div class='card'>");
        out.println("<h3>1. HttpSession Status</h3>");
        out.println("<table>");
        out.println("<tr><td>Session ID</td><td><code>" + session.getId() + "</code></td></tr>");
        out.println("<tr><td>Creation Time</td><td>" + new java.util.Date(session.getCreationTime()) + "</td></tr>");
        out.println("<tr><td>Last Accessed Time</td><td>" + new java.util.Date(session.getLastAccessedTime()) + "</td></tr>");
        out.println("<tr><td>Visit Count</td><td><b>" + visitCount + "</b></td></tr>");
        out.println("<tr><td>Logged-in Session User</td><td><b style='color:#2563eb;'>" + (sessionUser != null ? sessionUser : "Not Authenticated") + "</b></td></tr>");
        out.println("</table>");
        out.println("</div>");

        out.println("<div class='card'>");
        out.println("<h3>2. Cookies Tracking</h3>");
        out.println("<p><b>Cookie 'TRACKING_USER':</b> " + (cookieUser != null ? cookieUser : "None set") + "</p>");
        out.println("<p><i>Cookies are stored client-side in the browser header and passed automatically on subsequent requests.</i></p>");
        out.println("</div>");

        out.println("<div class='card'>");
        out.println("<h3>3. URL Rewriting</h3>");
        out.println("<p>Encoded URL with JSESSIONID fallback:</p>");
        out.println("<p><code>" + rewrittenUrl + "</code></p>");
        out.println("<p><a href='" + rewrittenUrl + "'>Click to test URL Rewriting link &rarr;</a></p>");
        out.println("</div>");

        out.println("<div class='card'>");
        out.println("<h3>Working Login Example Using Session Tracking</h3>");
        if (sessionUser == null) {
            out.println("<form method='POST' action='" + req.getContextPath() + "/servlet/session-tracking'>");
            out.println("<label>Username / Email: </label><br>");
            out.println("<input type='text' name='username' value='alex.morgan' style='padding:6px;width:250px;' required /><br><br>");
            out.println("<label>Password: </label><br>");
            out.println("<input type='password' name='password' value='Password123' style='padding:6px;width:250px;' required /><br><br>");
            out.println("<label><input type='checkbox' name='rememberMe' value='true' checked /> Remember via Cookie</label><br><br>");
            out.println("<button type='submit' style='padding:8px 16px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;'>Log In with Session</button>");
            out.println("</form>");
        } else {
            out.println("<p style='color:#16a34a;font-weight:bold;'>Authenticated as " + sessionUser + "</p>");
            out.println("<p><a href='" + logoutUrl + "' style='color:#dc2626;'>Log Out (Invalidate Session & Clear Cookie)</a></p>");
        }
        out.println("</div>");

        out.println("<p><a href='/'>&larr; Return to Application</a></p>");
        out.println("</body></html>");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String username = req.getParameter("username");
        String rememberMe = req.getParameter("rememberMe");

        // Working login session logic
        HttpSession session = req.getSession(true);
        session.setAttribute("SESSION_USER", username);
        session.setMaxInactiveInterval(30 * 60); // 30 minutes timeout

        // Optional Cookie persistence
        if ("true".equalsIgnoreCase(rememberMe)) {
            Cookie userCookie = new Cookie("TRACKING_USER", username);
            userCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
            userCookie.setPath("/");
            resp.addCookie(userCookie);
        }

        // Redirect back using URL rewriting
        String redirectUrl = resp.encodeRedirectURL(req.getContextPath() + "/servlet/session-tracking");
        resp.sendRedirect(redirectUrl);
    }
}
