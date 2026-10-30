# ON TIME: Task Scheduler & Reminder Management System
## Comprehensive Advanced Java University Project Report
**Course:** Advanced Java Programming, Enterprise Frameworks & Software Architecture  
**Academic Level:** Undergraduate / Graduate Degree Syllabus  
**Technologies:** Java 17, Spring Boot 3, Spring MVC, JSP, JDBC, Servlets, Spring Data JPA, Spring Security, MySQL, Maven, Swagger OpenAPI  

---

### Executive Summary & Abstract
The **ON TIME Task Scheduler and Reminder Management System** is an enterprise-grade application engineered to satisfy all requirements of an Advanced Java University syllabus. The system provides real-time task scheduling, priority management, category-based organization, reminder notification workflows, and analytics reporting. 

The software architecture strictly adheres to enterprise design patterns, featuring:
1. **Presentation Layer:** JavaServer Pages (JSP) utilizing Expression Language (EL), Jakarta Taglibs (JSTL), scriptlets, expressions, and directives.
2. **Controller Layer:** Spring MVC Web Controllers and RESTful API Controllers.
3. **Service Layer:** Transactional business logic demonstrating Dependency Injection (Constructor, Setter, and Field Injection).
4. **Data Access Layer:** Dual persistence pipelines demonstrating Spring Data JPA (`JpaRepository` and `CrudRepository`) alongside raw JDBC (`Statement`, `PreparedStatement`, `CallableStatement`) and Spring JDBC (`JdbcTemplate`).
5. **Database Layer:** Relational MySQL schema with foreign keys, indexes, cascades, and stored procedures.

---

### Table of Contents
1. System Architecture & Layered Design
2. Module 1: JDBC & Servlets Technical Implementation
3. Module 2: JavaServer Pages (JSP) Architecture
4. Module 3: Spring Framework Core & Spring JDBC
5. Module 4: Spring MVC & Spring Boot
6. Module 5: Java Persistence API (JPA) & ORM
7. REST API Architecture, Versioning & Content Negotiation
8. Background Task Scheduling & Automation
9. Security Architecture & Role-Based Access Control (RBAC)
10. Database Schema, Relations & Stored Procedures
11. Swagger OpenAPI & Postman Test Suite
12. University Evaluation & Syllabus Compliance Matrix

---

### 1. System Architecture & Layered Design
The system follows a strict 5-tier enterprise architecture:

```text
[ Browser / Client ] 
       │
       ├── (HTTP / JSP Requests) ──────► [ Spring MVC Controllers ] ──► [ JSP View Resolver ] ──► [ JSP Views ]
       └── (REST JSON/XML Requests) ──► [ Spring REST Controllers ] ──► [ Global Exception Handler ]
                                                        │
                                                        ▼
                                                [ Service Layer ]
                                          (Constructor/Setter/Field DI)
                                                        │
                         ┌──────────────────────────────┴──────────────────────────────┐
                         ▼                                                             ▼
            [ Spring Data JPA Layer ]                                       [ Spring JDBC / Raw JDBC ]
       (JpaRepository & CrudRepository)                               (JdbcTemplate & PreparedStatement)
                         │                                                             │
                         └──────────────────────────────┬──────────────────────────────┘
                                                        ▼
                                            [ MySQL Relational DB ]
                                        (Tables, Constraints, SPs)
```

---

### 2. Module 1: JDBC & Servlets Technical Implementation

#### A. Raw JDBC Demonstration (`JdbcConnectionFactory.java`)
- **JDBC Driver Loading:** Dynamically registers `com.mysql.cj.jdbc.Driver` via `Class.forName()`.
- **Database Connectivity:** Initializes `java.sql.Connection` using parameterized connection strings with connection pooling safeguards.
- **Statement & ResultSet:** Queries dynamic metadata using `Statement` and traverses tabular results with `ResultSetMetaData`.
- **PreparedStatement:** Protects against SQL Injection through parameterized inputs (`?`).
- **Transaction Management:** Enforces ACID properties using:
  ```java
  conn.setAutoCommit(false);
  // Execute multi-table operations (Insert Task + Insert Reminder)
  conn.commit();
  // In catch block:
  conn.rollback();
  ```
- **Stored Procedures:** Calls `sp_get_user_task_summary` using `CallableStatement` with registered `IN` and `OUT` parameters.

#### B. Servlet Architecture & Lifecycle
- **`GenericDemoServlet.java`:** Extends `jakarta.servlet.GenericServlet`, demonstrating protocol-agnostic lifecycle via `service(ServletRequest, ServletResponse)`.
- **`HttpDemoServlet.java`:** Extends `jakarta.servlet.http.HttpServlet`, implementing full HTTP lifecycle: `init()`, `doGet()`, `doPost()`, and `destroy()`.
- **Request Dispatching:**
  - `RequestDispatcher.forward()`: Server-side request delegation preserving request attributes.
  - `RequestDispatcher.include()`: Dynamic component and template inclusion.
  - `response.sendRedirect()`: Client-side HTTP 302 redirection.

#### C. Session Tracking Mechanism (`SessionTrackingServlet.java`)
The system provides a unified demonstration of all three fundamental session tracking mechanisms:
1. **Cookies:** Persistent and session cookies (`Cookie("TRACKING_USER", username)`).
2. **URL Rewriting:** `response.encodeURL()` appending `;jsessionid=...` when cookies are disabled.
3. **HttpSession:** Server-side state tracking with `session.setAttribute()`, `session.getId()`, and session invalidation on logout.

---

### 3. Module 2: JavaServer Pages (JSP) Architecture

#### Scripting Elements & Implicit Objects
- **Declarations (`<%! ... %>`):** Methods defined at the class level within the translated servlet class (`login.jsp`).
- **Scriptlets (`<% ... %>`):** Business logic executed inside the `_jspService()` lifecycle method.
- **Expressions (`<%= ... %>`):** Direct output generation without calling `out.print()`.
- **Implicit Objects Demonstrated:**
  - `request`: Parameter and header inspection.
  - `response`: Content-type and redirect handling.
  - `session`: User state and session ID rendering.
  - `application`: ServletContext and initialization parameter access.
  - `pageContext`: Page-scoped attribute lifecycle.
  - `out`: Direct output stream writing.

#### Directives & Exception Handling
- **`<%@ page %>`:** Sets language, contentType, pageEncoding, and error page properties.
- **`<%@ include %>`:** Statically includes header (`header.jspf`) and footer (`footer.jspf`) fragments at translation time.
- **`<%@ taglib %>`:** Imports JSTL Core (`c:`) and Formatting (`fmt:`) libraries.
- **Custom Error Page (`error.jsp`):** Declares `<%@ page isErrorPage="true" %>` and leverages the implicit `exception` object to render error codes and stack traces.

---

### 4. Module 3: Spring Framework Core & Spring JDBC

#### Dependency Injection (DI) Patterns
To demonstrate Spring Core IoC capabilities, three separate services demonstrate distinct injection approaches:
1. **Constructor Injection (`TaskServiceImpl.java`):** Recommended enterprise approach for immutable, strictly required dependencies.
2. **Setter Injection (`ReminderServiceImpl.java`):** Setter methods annotated with `@Autowired` for reconfigurable dependencies.
3. **Field Injection (`UserServiceImpl.java`):** Direct injection into private members via `@Autowired`.

#### Spring JDBC (`SpringJdbcReportDao.java`)
Bypasses JPA to execute direct queries via `JdbcTemplate`:
- **User Search:** Parameterized search using `RowMapper` mapping to dynamic DTOs.
- **Report Generation:** Multi-table aggregations calculating completion rates and priority breakdowns.
- **Statistics:** KPI counts executed through optimized native SQL queries.

---

### 5. Module 4: Spring MVC & Spring Boot

#### Spring MVC Architecture
- **Controllers:** `WebAuthController` and `WebDashboardController`.
- **Model:** Populates UI data into `org.springframework.ui.Model`.
- **View:** Resolves views via `InternalResourceViewResolver` (`/WEB-INF/views/*.jsp`).
- **Form Handling & Validation:** Java Bean Validation (`@Valid`, `@NotBlank`, `@Size`, `@Email`) coupled with `BindingResult`.
- **Lombok Integration:** `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder` across all entities and DTOs.

---

### 6. Module 5: Java Persistence API (JPA) & ORM

#### Entity Mapping & Relationships
- `@Entity`, `@Table(name = "...")`, `@Id`, `@GeneratedValue(strategy = GenerationType.IDENTITY)`.
- **`@OneToMany` & `@ManyToOne`:** Bidirectional mapping between `User` & `Task`, and between `Task` & `Reminder`.
- **`@ManyToMany`:** User-to-Role security mapping utilizing `@JoinTable(name = "user_roles")`.

#### Repository Pattern Demonstration
- **`JpaRepository`:** Demonstrated in `UserRepository`, `RoleRepository`, and `TaskRepository` for sorting, pagination, and JPQL queries.
- **`CrudRepository`:** Demonstrated in `ReminderRepository`, illustrating foundational Spring Data interfaces.

---

### 7. REST API Architecture, Versioning & Content Negotiation

#### HTTP Status Code Management
- `200 OK`: Successful queries and updates.
- `201 CREATED`: Creation of Tasks, Reminders, and Users.
- `204 NO CONTENT`: Deletion operations.
- `400 BAD REQUEST`: Validation errors and invalid parameters.
- `401 UNAUTHORIZED`: Authentication failures.
- `403 FORBIDDEN`: Access denied.
- `404 NOT FOUND`: Entity lookups with missing keys.
- `500 INTERNAL SERVER ERROR`: Unhandled runtime exceptions.

#### API Versioning Matrix
1. **URI Versioning:**
   - `/api/v1/tasks` (Standard specification)
   - `/api/v2/tasks` (Enhanced metadata envelope)
2. **Header Versioning:** Dispatched via `X-API-VERSION: 1` or `X-API-VERSION: 2`.
3. **Parameter Versioning:** Dispatched via query parameter `?version=1` or `?version=2`.

#### Content Negotiation
Supports both `application/json` and `application/xml` through Jackson XML extension (`@JacksonXmlRootElement`).

---

### 8. Background Task Scheduling & Automation
Annotated with `@EnableScheduling`, `TaskReminderScheduler.java` runs background threads:
- **Reminder Execution:** Checks every 60 seconds (`@Scheduled(fixedRate = 60000)`) for pending reminders whose alert time has passed.
- **Due Task Detection:** Identifies uncompleted tasks with passed deadlines.
- **Midnight System Audit:** Executes daily cleanup at 00:00:00 via cron expression `0 0 0 * * ?`.

---

### 9. Security Architecture & Role-Based Access Control
Implemented in `SecurityConfig.java`:
- **BCrypt Password Encoder:** Salted hashing with strength factor 10.
- **Roles:** `ROLE_USER` and `ROLE_ADMIN`.
- **Access Policies:** Strict URL matching for admin operations vs public authentication endpoints.

---

### 10. Database Schema & Stored Procedures
Defined in `src/main/resources/schema.sql`:
- Tables: `roles`, `users`, `user_roles`, `tasks`, `reminders`.
- Indexes: `idx_task_user_deadline`, `idx_task_status`, `idx_task_priority`, `idx_reminder_time_status`.
- Stored Procedure: `sp_get_user_task_summary`.

---

### 11. Swagger OpenAPI & Postman Test Suite
- **Swagger UI:** Accessible at `http://localhost:8080/swagger-ui.html`.
- **Postman Test Collection:** Located at `postman/Task_Scheduler_Postman_Collection.json`, containing 18 automated request tests covering all endpoints, versioning schemes, and XML/JSON formats.

---

### 12. University Evaluation & Syllabus Compliance Matrix

| Syllabus Requirement | Project File Location | Status |
| :--- | :--- | :--- |
| **JDBC Driver & Connection** | `com/taskscheduler/jdbc/JdbcConnectionFactory.java` | **100% Implemented** |
| **PreparedStatement & Transactions** | `com/taskscheduler/jdbc/JdbcConnectionFactory.java` | **100% Implemented** |
| **Stored Procedures (CallableStatement)** | `src/main/resources/schema.sql` & `JdbcConnectionFactory.java` | **100% Implemented** |
| **GenericServlet & HttpServlet** | `com/taskscheduler/servlet/GenericDemoServlet.java`, `HttpDemoServlet.java` | **100% Implemented** |
| **RequestDispatcher forward & include** | `com/taskscheduler/servlet/DispatcherDemoServlet.java` | **100% Implemented** |
| **response.sendRedirect** | `com/taskscheduler/servlet/RedirectDemoServlet.java` | **100% Implemented** |
| **Session Tracking (Cookies, URL, Session)**| `com/taskscheduler/servlet/SessionTrackingServlet.java` | **100% Implemented** |
| **JSP Scripting Elements (<%!, <%, <%=)** | `src/main/webapp/WEB-INF/views/login.jsp` | **100% Implemented** |
| **JSP Implicit Objects & Directives** | `src/main/webapp/WEB-INF/views/dashboard.jsp`, `header.jspf` | **100% Implemented** |
| **JSP Error Page (isErrorPage="true")** | `src/main/webapp/WEB-INF/views/error.jsp` | **100% Implemented** |
| **Spring Core IoC & Bean Management** | `com/taskscheduler/config/SpringCoreJavaConfig.java` | **100% Implemented** |
| **Constructor, Setter & Field Injection** | `com/taskscheduler/service/DependencyInjectionShowcaseService.java` | **100% Implemented** |
| **Spring JDBC (JdbcTemplate)** | `com/taskscheduler/jdbc/SpringJdbcReportDao.java` | **100% Implemented** |
| **Spring MVC & JSP Views** | `com/taskscheduler/controller/WebDashboardController.java` | **100% Implemented** |
| **Spring Data JPA (Entities & Relations)** | `com/taskscheduler/entity/*.java` | **100% Implemented** |
| **JpaRepository & CrudRepository** | `com/taskscheduler/repository/*.java` | **100% Implemented** |
| **All HTTP Methods (GET, POST, PUT, DELETE, PATCH)** | `com/taskscheduler/controller/TaskRestController.java` | **100% Implemented** |
| **API Versioning (URI, Header, Param)** | `com/taskscheduler/controller/TaskRestController.java` | **100% Implemented** |
| **JSON & XML Support (Jackson XML)** | `com/taskscheduler/dto/ApiResponseDTO.java` | **100% Implemented** |
| **Swagger OpenAPI 3.0** | `com/taskscheduler/config/OpenApiConfig.java` | **100% Implemented** |
| **Spring Security & BCrypt** | `com/taskscheduler/config/SecurityConfig.java` | **100% Implemented** |
| **Background Scheduler (@Scheduled)** | `com/taskscheduler/scheduler/TaskReminderScheduler.java` | **100% Implemented** |
| **Postman Test Collection** | `postman/Task_Scheduler_Postman_Collection.json` | **100% Implemented** |
