# ON TIME — Task Scheduler & Reminder Management System
### Advanced Java University Project & Spring Boot Architecture

> **University Syllabus Requirements Fully Implemented:**
> - **Module 1**: JDBC (Driver, Connection, Statement, PreparedStatement, ResultSet, Transactions, Stored Procedures) & Servlets (GenericServlet, HttpServlet, Life Cycle, RequestDispatcher forward/include, sendRedirect, Session Tracking with Cookies, URL Rewriting, HttpSession).
> - **Module 2**: JSP (Life Cycle, Scripting Elements `<%! %>`, `<% %>`, `<%= %>`, Implicit Objects, Directives, EL, Error Pages, Servlet-JSP-JDBC Integration).
> - **Module 3**: Spring Framework Core (IoC, Bean Management, Constructor/Setter/Field DI, Java Config, Component Scanning) & Spring JDBC (`JdbcTemplate` for User Search, Reports, Statistics).
> - **Module 4**: Spring MVC & Spring Boot (JSP Views, Form Handling, `@Valid`, Profiles, Lombok, HTTP Methods GET/POST/PUT/DELETE/PATCH).
> - **Module 5**: JPA & Hibernate ORM (`@Entity`, `@Table`, `@Id`, `@GeneratedValue`, `@Column`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`, `JpaRepository` & `CrudRepository`).
> - **REST APIs**: URI Versioning (`/api/v1`, `/api/v2`), Header Versioning (`X-API-VERSION`), Parameter Versioning (`?version=`), JSON & XML (Jackson XML), `@ControllerAdvice` Exception Handling, HTTP Status Codes (200, 201, 204, 400, 401, 403, 404, 500).
> - **Scheduler Feature**: `@EnableScheduling` & `@Scheduled` for automatic reminder execution and due task detection.
> - **Security**: Spring Security, BCrypt password hashing, Role-Based Access (`ROLE_ADMIN`, `ROLE_USER`).
> - **Swagger OpenAPI**: Interactive API documentation at `/swagger-ui.html`.
> - **Postman Collection**: Located at `postman/Task_Scheduler_Postman_Collection.json`.

---

## 1. Project Directory Structure

```text
├── pom.xml                                   # Complete Maven Build Configuration
├── README.md                                 # Project Overview & Execution Guide
├── PROJECT_REPORT.md                         # Formal University Academic Project Report
├── postman/
│   └── Task_Scheduler_Postman_Collection.json# Complete Postman Test Suite
├── src/
│   ├── main/
│   │   ├── java/com/taskscheduler/
│   │   │   ├── TaskSchedulerApplication.java # Spring Boot Main Class (@SpringBootApplication, @EnableScheduling)
│   │   │   ├── config/
│   │   │   │   ├── OpenApiConfig.java        # Swagger OpenAPI 3.0 Configuration
│   │   │   │   ├── SecurityConfig.java       # Spring Security & BCrypt Password Encoder
│   │   │   │   ├── SpringCoreJavaConfig.java # Spring Core IoC & Bean Configuration
│   │   │   │   └── WebMvcConfig.java         # Spring MVC & JSP View Resolver
│   │   │   ├── controller/
│   │   │   │   ├── AuthRestController.java   # Auth REST Controller (JSON/XML)
│   │   │   │   ├── DashboardRestController.java # Dashboard & Spring JDBC Reports
│   │   │   │   ├── ReminderRestController.java  # Reminder Management REST APIs
│   │   │   │   ├── TaskRestController.java   # Task REST APIs (v1, v2, Headers, Params)
│   │   │   │   ├── WebAuthController.java    # Spring MVC Controller for JSP Login/Register
│   │   │   │   └── WebDashboardController.java # Spring MVC Controller for JSP Views
│   │   │   ├── dto/                          # Data Transfer Objects
│   │   │   ├── entity/                       # JPA Entities (User, Role, Task, Reminder)
│   │   │   ├── exception/                    # Global Exception Handler (@ControllerAdvice)
│   │   │   ├── jdbc/
│   │   │   │   ├── JdbcConnectionFactory.java# Raw JDBC (Driver, Connection, PreparedStatement, Transactions, Stored Procs)
│   │   │   │   └── SpringJdbcReportDao.java  # Spring JDBC (JdbcTemplate User Search, Reports, Statistics)
│   │   │   ├── repository/                   # Spring Data JPA (JpaRepository & CrudRepository)
│   │   │   ├── scheduler/
│   │   │   │   └── TaskReminderScheduler.java# @Scheduled Background Tasks
│   │   │   ├── service/                      # Services demonstrating Constructor, Setter & Field Injection
│   │   │   └── servlet/                      # Servlets (GenericServlet, HttpServlet, RequestDispatcher, Session Tracking)
│   │   ├── resources/
│   │   │   ├── application.properties        # Main Spring Boot Configuration
│   │   │   ├── application-dev.properties    # Dev Profile (H2 in-memory)
│   │   │   ├── application-prod.properties   # Production Profile (MySQL)
│   │   │   ├── schema.sql                    # Full MySQL DDL & Stored Procedure
│   │   │   └── data.sql                      # Seed Data (Admin, Users, Tasks, Reminders)
│   │   └── webapp/
│   │       └── WEB-INF/
│   │           ├── web.xml                   # Deployment Descriptor
│   │           └── views/
│   │               ├── header.jspf           # JSP Fragment (Directive <%@ include %>)
│   │               ├── footer.jspf           # JSP Fragment
│   │               ├── login.jsp             # JSP Login (Scripting Elements & Implicit Objects)
│   │               ├── register.jsp          # JSP Registration Form
│   │               ├── dashboard.jsp         # JSP Dashboard (JSTL <c:forEach>, EL, Spring JDBC integration)
│   │               ├── tasks.jsp             # JSP Task Management View
│   │               ├── reminders.jsp         # JSP Reminder View
│   │               └── error.jsp             # Custom JSP Error Page (isErrorPage="true")
```

---

## 2. Prerequisites & Running the Java Application

### Prerequisites
- **JDK 17 or higher** (`java -version`, `javac -version`)
- **Apache Maven 3.8+** (`mvn -version`)
- *(Optional for Prod)* **MySQL 8.0+** running on localhost:3306 (or uses automatic H2 database in `dev` profile)

### Quick Start (Dev Profile with In-Memory Database)
```bash
# Clone or navigate to the project directory
cd on-time-task-scheduler

# Build the project using Maven
mvn clean package -DskipTests

# Run the Spring Boot Application
mvn spring-boot:run
```

The application will start on **`http://localhost:8080`**.

### Running with MySQL (Production Profile)
1. Create MySQL database:
   ```sql
   CREATE DATABASE task_scheduler_db;
   ```
2. Run Spring Boot with production profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=prod
   ```

---

## 3. Key URLs for Grading & Verification

| Module / Topic | URL | Description |
| :--- | :--- | :--- |
| **Spring MVC / JSP Dashboard** | `http://localhost:8080/dashboard` | Main JSP Dashboard with EL, JSTL, and Spring JDBC report |
| **JSP Login System** | `http://localhost:8080/login` | JSP Scripting elements, implicit objects, and form authentication |
| **JSP Registration** | `http://localhost:8080/register` | JSP form handling with validation |
| **Custom JSP Error Page** | `http://localhost:8080/WEB-INF/views/error.jsp` | Demonstrates `isErrorPage="true"` and implicit `exception` |
| **GenericServlet Demo** | `http://localhost:8080/servlet/generic-demo` | Extends `GenericServlet`, implements `service()` |
| **HttpServlet Lifecycle** | `http://localhost:8080/servlet/http-demo` | Demonstrates `init()`, `doGet()`, `doPost()`, `destroy()` |
| **RequestDispatcher Demo** | `http://localhost:8080/servlet/dispatcher-demo` | Demonstrates `.forward()` and `.include()` |
| **Response Redirect Demo** | `http://localhost:8080/servlet/redirect-demo` | Demonstrates `response.sendRedirect()` |
| **Session Tracking Demo** | `http://localhost:8080/servlet/session-tracking` | Demonstrates Cookies, URL Rewriting, and `HttpSession` |
| **Spring JDBC Statistics** | `http://localhost:8080/api/reports/statistics` | Database access using `JdbcTemplate` instead of JPA |
| **Spring JDBC User Search**| `http://localhost:8080/api/reports/search-users?keyword=alex` | Parameterized search with `JdbcTemplate` RowMapper |
| **Raw JDBC Transaction** | `http://localhost:8080/api/reports/raw-jdbc-transaction` | Manual ACID transaction management (commit/rollback) |
| **Raw JDBC Stored Proc** | `http://localhost:8080/api/reports/stored-procedure` | Executes `sp_get_user_task_summary` via `CallableStatement` |
| **Swagger OpenAPI 3.0** | `http://localhost:8080/swagger-ui.html` | Interactive Swagger API documentation |
| **OpenAPI v3 JSON Specs** | `http://localhost:8080/v3/api-docs` | OpenAPI JSON schema |
| **H2 Database Console** | `http://localhost:8080/h2-console` | In-memory DB console (JDBC URL: `jdbc:h2:mem:taskscheduler_dev`) |

---

## 4. Default Demonstration Credentials

- **Standard User**: `user@example.com` / `Password123` (Role: `ROLE_USER`)
- **System Admin**: `admin@example.com` / `Password123` (Roles: `ROLE_USER`, `ROLE_ADMIN`)
