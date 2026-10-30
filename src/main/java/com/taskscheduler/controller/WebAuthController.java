package com.taskscheduler.controller;

import com.taskscheduler.dto.AuthRequestDTO;
import com.taskscheduler.dto.UserDTO;
import com.taskscheduler.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Spring MVC Controller for Web Authentication and JSP Views.
 * Fulfills Module 2 & 4 Requirements:
 * - Spring MVC Controllers
 * - Model & View handling
 * - Passing Data Controller -> View
 * - Form Handling & Validation (@Valid, BindingResult)
 * - JSP Views (login.jsp, register.jsp)
 * - Session Tracking integration
 */
@Controller
public class WebAuthController {

    private final UserService userService;

    @Autowired
    public WebAuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/login")
    public String showLoginForm(Model model,
                                @RequestParam(value = "error", required = false) String error,
                                @RequestParam(value = "logout", required = false) String logout) {
        if (error != null) {
            model.addAttribute("errorMessage", "Invalid email or password. Please try again.");
        }
        if (logout != null) {
            model.addAttribute("successMessage", "You have been successfully logged out.");
        }
        model.addAttribute("loginForm", new AuthRequestDTO.Login());
        return "login"; // Resolves to /WEB-INF/views/login.jsp
    }

    @PostMapping("/login")
    public String processLogin(@Valid @ModelAttribute("loginForm") AuthRequestDTO.Login loginForm,
                               BindingResult bindingResult,
                               HttpSession session,
                               Model model) {
        if (bindingResult.hasErrors()) {
            return "login";
        }

        try {
            AuthRequestDTO.Response response = userService.login(loginForm);
            session.setAttribute("USER_ID", response.getUser().getId());
            session.setAttribute("USER_NAME", response.getUser().getFullName());
            session.setAttribute("USER_EMAIL", response.getUser().getEmail());
            return "redirect:/dashboard";
        } catch (Exception e) {
            model.addAttribute("errorMessage", e.getMessage());
            return "login";
        }
    }

    @GetMapping("/register")
    public String showRegisterForm(Model model) {
        model.addAttribute("registerForm", new AuthRequestDTO.Register());
        return "register"; // Resolves to /WEB-INF/views/register.jsp
    }

    @PostMapping("/register")
    public String processRegistration(@Valid @ModelAttribute("registerForm") AuthRequestDTO.Register registerForm,
                                      BindingResult bindingResult,
                                      Model model) {
        if (bindingResult.hasErrors()) {
            return "register";
        }

        try {
            UserDTO createdUser = userService.register(registerForm);
            model.addAttribute("successMessage", "Registration successful! Please log in.");
            return "redirect:/login?registered=true";
        } catch (Exception e) {
            model.addAttribute("errorMessage", e.getMessage());
            return "register";
        }
    }

    @GetMapping("/logout")
    public String processLogout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return "redirect:/login?logout=true";
    }
}
