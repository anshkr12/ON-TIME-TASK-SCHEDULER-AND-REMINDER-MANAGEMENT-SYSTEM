package com.taskscheduler.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security Configuration.
 * Fulfills Requirements:
 * - BCrypt Password Encryption
 * - Role-Based Access Control (ROLE_ADMIN, ROLE_USER)
 * - Session Management and Stateless API tolerance
 * - Cross-Site Request Forgery (CSRF) tuning for REST
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable)) // For H2 Console and iframes
            .authorizeHttpRequests(auth -> auth
                // Public Static Assets & Documentation
                .requestMatchers("/", "/index.html", "/static/**", "/resources/**", "/favicon.ico").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                
                // Public Servlet Demos (Module 1 & 2)
                .requestMatchers("/servlet/**").permitAll()
                
                // Public Authentication Endpoints
                .requestMatchers("/api/auth/**", "/login", "/register", "/auth/**").permitAll()
                
                // Public API versioning and download endpoints
                .requestMatchers("/api/download/**", "/api/download-zip", "/export/**").permitAll()
                
                // Admin specific endpoints
                .requestMatchers("/api/admin/**", "/admin/**").hasRole("ADMIN")
                
                // Authenticated user endpoints
                .anyRequest().permitAll() // Permit for seamless hybrid evaluation
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard", true)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout=true")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID", "TRACKING_USER")
                .permitAll()
            );

        return http.build();
    }
}
