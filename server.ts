import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { createServer as createViteServer } from "vite";

interface UserRecord {
  id: number;
  fullName: string;
  email: string;
  passwordHash: string; // BCrypt simulation
  createdAt: string;
}

interface TaskRecord {
  id: number;
  title: string;
  description: string;
  category: 'STUDY' | 'WORK' | 'PERSONAL' | 'HEALTH' | 'OTHER';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  deadline: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

interface ReminderRecord {
  id: number;
  reminderTime: string;
  reminderMessage: string;
  reminderStatus: 'PENDING' | 'SENT' | 'DISMISSED';
  taskId: number;
}

interface NotificationEvent {
  id: string;
  timestamp: string;
  type: 'REMINDER' | 'OVERDUE' | 'INFO';
  title: string;
  message: string;
  read: boolean;
}

// In-Memory Database mimicking MySQL + Hibernate Persistence
let nextUserId = 2;
let nextTaskId = 6;
let nextReminderId = 5;

const users: UserRecord[] = [
  {
    id: 1,
    fullName: "Jane Doe",
    email: "demo@taskscheduler.com",
    passwordHash: "Password123", // In real app BCrypt encoded
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

// Helper to format ISO without milliseconds for clean UI
const getRelativeIso = (offsetHours: number) => {
  const d = new Date(Date.now() + offsetHours * 3600000);
  return d.toISOString();
};

const tasks: TaskRecord[] = [
  {
    id: 1,
    title: "Finish Advanced Java Final Project Report",
    description: "Prepare comprehensive documentation covering Spring Boot 3, Spring Data JPA, Hibernate, raw JDBC DAO, Servlets, and JSP views.",
    category: "STUDY",
    priority: "HIGH",
    status: "IN_PROGRESS",
    deadline: getRelativeIso(8), // 8 hours from now
    createdAt: getRelativeIso(-48),
    updatedAt: getRelativeIso(-2),
    userId: 1,
  },
  {
    id: 2,
    title: "Submit Sprint Release Deliverables",
    description: "Push verified WAR package, verify database migration schema.sql, and execute integration test suites.",
    category: "WORK",
    priority: "HIGH",
    status: "PENDING",
    deadline: getRelativeIso(24), // tomorrow
    createdAt: getRelativeIso(-24),
    updatedAt: getRelativeIso(-24),
    userId: 1,
  },
  {
    id: 3,
    title: "Quarterly Health Checkup & Dental Cleaning",
    description: "Visit clinic for routine annual medical diagnostics and dental cleaning appointment.",
    category: "HEALTH",
    priority: "MEDIUM",
    status: "PENDING",
    deadline: getRelativeIso(48), // 2 days from now
    createdAt: getRelativeIso(-12),
    updatedAt: getRelativeIso(-12),
    userId: 1,
  },
  {
    id: 4,
    title: "Review Research Paper on Microservices Architecture",
    description: "Read ACM SIGMOD survey paper on distributed transaction coordination and saga patterns.",
    category: "STUDY",
    priority: "LOW",
    status: "COMPLETED",
    deadline: getRelativeIso(-20),
    createdAt: getRelativeIso(-72),
    updatedAt: getRelativeIso(-10),
    userId: 1,
  },
  {
    id: 5,
    title: "Renew Cloud Domain & SSL Certificates",
    description: "Update billing payment method and download renewed X.509 certificates for the API gateway.",
    category: "OTHER",
    priority: "HIGH",
    status: "OVERDUE",
    deadline: getRelativeIso(-12), // 12 hours ago
    createdAt: getRelativeIso(-96),
    updatedAt: getRelativeIso(-12),
    userId: 1,
  },
];

const reminders: ReminderRecord[] = [
  {
    id: 1,
    reminderTime: getRelativeIso(2),
    reminderMessage: "Report due in 6 hours! Review final draft formatting and table of contents.",
    reminderStatus: "PENDING",
    taskId: 1,
  },
  {
    id: 2,
    reminderTime: getRelativeIso(18),
    reminderMessage: "Sprint release review call starts in 6 hours.",
    reminderStatus: "PENDING",
    taskId: 2,
  },
  {
    id: 3,
    reminderTime: getRelativeIso(-2),
    reminderMessage: "Immediate Action Required: Domain registration renewal notice.",
    reminderStatus: "SENT",
    taskId: 5,
  },
  {
    id: 4,
    reminderTime: getRelativeIso(36),
    reminderMessage: "Confirm clinic appointment 24 hours in advance.",
    reminderStatus: "PENDING",
    taskId: 3,
  },
];

const notifications: NotificationEvent[] = [
  {
    id: "notif-seed-1",
    timestamp: getRelativeIso(-2),
    type: "REMINDER",
    title: "Due Reminder Dispatched",
    message: "Immediate Action Required: Domain registration renewal notice (Task #5)",
    read: false,
  },
  {
    id: "notif-seed-2",
    timestamp: getRelativeIso(-12),
    type: "OVERDUE",
    title: "Task Marked Overdue",
    message: "Task 'Renew Cloud Domain & SSL Certificates' deadline has expired.",
    read: true,
  },
];

// Active sessions: map sessionToken -> userId
const sessions = new Map<string, number>();
// Default demo session
sessions.set("demo-session-token", 1);

// Helper to resolve current user
function getAuthenticatedUserId(req: Request): number | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (sessions.has(token)) return sessions.get(token)!;
  }
  // Also check cookie
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/TASKSCHEDULER_SESSIONID=([^;]+)/);
    if (match && sessions.has(match[1])) {
      return sessions.get(match[1])!;
    }
  }
  // Default to demo user for ease of testing if single user
  return 1;
}

// Background scheduler matching ReminderScheduler.java
function runScheduledJobs() {
  const now = new Date();
  let remindersProcessed = 0;
  let tasksOverdue = 0;

  // 1. Due reminders (reminder_time <= now and status == 'PENDING')
  for (const reminder of reminders) {
    if (reminder.reminderStatus === "PENDING" && new Date(reminder.reminderTime) <= now) {
      reminder.reminderStatus = "SENT";
      remindersProcessed++;

      const task = tasks.find((t) => t.id === reminder.taskId);
      const notif: NotificationEvent = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        type: "REMINDER",
        title: "Reminder Alert Triggered",
        message: reminder.reminderMessage + (task ? ` (Task: "${task.title}")` : ""),
        read: false,
      };
      notifications.unshift(notif);
      console.log(`[REMINDER NOTIFICATION] Task: '${task?.title}' | Message: ${reminder.reminderMessage}`);
    }
  }

  // 2. Overdue tasks (deadline < now and status NOT IN ('COMPLETED', 'OVERDUE'))
  for (const task of tasks) {
    if (task.status !== "COMPLETED" && task.status !== "OVERDUE" && new Date(task.deadline) < now) {
      task.status = "OVERDUE";
      task.updatedAt = new Date().toISOString();
      tasksOverdue++;

      const notif: NotificationEvent = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        type: "OVERDUE",
        title: "Task Overdue Notice",
        message: `Task "${task.title}" has passed its scheduled deadline.`,
        read: false,
      };
      notifications.unshift(notif);
      console.log(`[OVERDUE TASK] Task '${task.title}' (id=${task.id}) marked OVERDUE`);
    }
  }

  return { remindersProcessed, tasksOverdue };
}

// Start periodic scheduler (every 20 seconds)
setInterval(runScheduledJobs, 20000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/export") || req.path === "/ping") {
      console.log(`[HTTP] ${req.method} ${req.path}`);
    }
    next();
  });

  // -------------------------------------------------------------
  // Raw Servlet Demonstrations (Required by Syllabus)
  // -------------------------------------------------------------

  // 1. GenericServlet demo: /ping
  app.get("/ping", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/plain; charset=UTF-8");
    res.send(`Task Scheduler service is alive.\nServer time: ${new Date().toISOString()}\nGenericServlet protocol: OK`);
  });

  // 2. HttpServlet + Raw JDBC export demo: /export/tasks
  app.get("/export/tasks", (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req) || 1;
    const user = users.find((u) => u.id === userId);
    const userTasks = tasks.filter((t) => t.userId === userId);

    // Set cookie as in TaskExportServlet.java
    res.setHeader("Set-Cookie", `LAST_VISIT=export-${Date.now()}; Path=/; HttpOnly`);
    res.setHeader("Content-Type", "text/plain; charset=UTF-8");

    let output = "===== Task Export (via raw JDBC + HttpServlet) =====\n";
    output += `Exported By: ${user?.fullName || "Demo User"} (${user?.email || "demo@taskscheduler.com"})\n`;
    output += `Generated At: ${new Date().toLocaleString()}\n`;
    output += `Total Records: ${userTasks.length}\n`;
    output += "-----------------------------------------------------\n";

    if (userTasks.length === 0) {
      output += "No tasks found.\n";
    } else {
      userTasks.forEach((t) => {
        output += `[#${t.id}] ${t.title} - ${t.status} | Priority: ${t.priority} | Category: ${t.category} (Due: ${t.deadline})\n`;
      });
    }

    output += "-----------------------------------------------------\n";
    output += "Transaction Status: AUTO-COMMIT SUCCESS (0 Rollbacks)\n";
    res.send(output);
  });

  // -------------------------------------------------------------
  // Full Project ZIP Download Endpoint
  // -------------------------------------------------------------
  app.get(["/api/download-zip", "/download-zip", "/api/download", "/download", "/project.zip", "/on-time-task-scheduler.zip"], (req: Request, res: Response) => {
    const zipPath = path.join(process.cwd(), "public", "task-scheduler-project.zip");
    if (!fs.existsSync(zipPath)) {
      try {
        execSync("python3 create_zip.py", { cwd: process.cwd() });
      } catch (err) {
        console.error("Failed to generate zip", err);
      }
    }

    if (fs.existsSync(zipPath)) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="on-time-task-scheduler.zip"');
      return res.sendFile(zipPath);
    } else {
      return res.status(500).json({ success: false, message: "Could not generate zip archive" });
    }
  });

  // -------------------------------------------------------------
  // REST APIs (Spring MVC & Spring Security implementation)
  // Base Path: /api/v1
  // -------------------------------------------------------------

  // Auth: Register
  app.post("/api/v1/auth/register", (req: Request, res: Response) => {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
        data: null,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match",
        data: null,
      });
    }

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({
        success: false,
        message: `An account with this email already exists: ${email}`,
        data: null,
      });
    }

    const newUser: UserRecord = {
      id: nextUserId++,
      fullName,
      email,
      passwordHash: password,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);

    const token = `token-${newUser.id}-${Date.now()}`;
    sessions.set(token, newUser.id);
    res.setHeader("Set-Cookie", `TASKSCHEDULER_SESSIONID=${token}; Path=/; HttpOnly`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        createdAt: newUser.createdAt,
        token,
      },
    });
  });

  // Auth: Login
  app.post("/api/v1/auth/login", (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = users.find(
      (u) => u.email.toLowerCase() === email?.toLowerCase() && u.passwordHash === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: null,
      });
    }

    const token = `token-${user.id}-${Date.now()}`;
    sessions.set(token, user.id);
    res.setHeader("Set-Cookie", `TASKSCHEDULER_SESSIONID=${token}; Path=/; HttpOnly`);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        token,
      },
    });
  });

  // Auth: Current User
  app.get("/api/v1/auth/me", (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authenticated", data: null });
    }
    res.json({
      success: true,
      message: "User fetched successfully",
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  });

  // Auth: Logout
  app.post("/api/v1/auth/logout", (req: Request, res: Response) => {
    res.setHeader("Set-Cookie", "TASKSCHEDULER_SESSIONID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    res.json({
      success: true,
      message: "Logout successful",
      data: null,
    });
  });

  // Dashboard Stats
  app.get("/api/v1/dashboard/stats", (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req) || 1;
    const userTasks = tasks.filter((t) => t.userId === userId);

    const total = userTasks.length;
    const pending = userTasks.filter((t) => t.status === "PENDING").length;
    const inProgress = userTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const completed = userTasks.filter((t) => t.status === "COMPLETED").length;
    const overdue = userTasks.filter((t) => t.status === "OVERDUE").length;
    const highPriority = userTasks.filter((t) => t.priority === "HIGH").length;

    const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 10000) / 100;

    res.json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        totalTasks: total,
        pendingTasks: pending,
        inProgressTasks: inProgress,
        completedTasks: completed,
        overdueTasks: overdue,
        highPriorityTasks: highPriority,
        completionPercentage,
      },
    });
  });

  // Tasks: Get All (with search, filtering, and sorting)
  app.get("/api/v1/tasks", (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req) || 1;
    let list = tasks.filter((t) => t.userId === userId);

    const { keyword, status, priority, category, sortBy, direction } = req.query as Record<string, string>;

    if (keyword && keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(kw) || t.description.toLowerCase().includes(kw)
      );
    }

    if (status && status !== "ALL") {
      list = list.filter((t) => t.status === status);
    }

    if (priority && priority !== "ALL") {
      list = list.filter((t) => t.priority === priority);
    }

    if (category && category !== "ALL") {
      list = list.filter((t) => t.category === category);
    }

    // Sort
    const sortField = (sortBy || "deadline").toLowerCase();
    const isDesc = direction?.toLowerCase() === "desc";

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === "priority") {
        const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = order[a.priority] - order[b.priority];
      } else if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "status") {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === "createdat") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        // default deadline
        comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return isDesc ? -comparison : comparison;
    });

    res.json({
      success: true,
      message: "Tasks fetched successfully",
      data: list,
    });
  });

  // Tasks: Overdue list
  app.get("/api/v1/tasks/overdue", (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req) || 1;
    const now = new Date();
    const overdueList = tasks.filter(
      (t) => t.userId === userId && (t.status === "OVERDUE" || (new Date(t.deadline) < now && t.status !== "COMPLETED"))
    );
    res.json({
      success: true,
      message: "Overdue tasks fetched successfully",
      data: overdueList,
    });
  });

  // Tasks: Get By ID
  app.get("/api/v1/tasks/:id", (req: Request, res: Response) => {
    const taskId = parseInt(req.params.id, 10);
    const userId = getAuthenticatedUserId(req) || 1;
    const task = tasks.find((t) => t.id === taskId && t.userId === userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id: '${taskId}'`,
        data: null,
      });
    }

    res.json({
      success: true,
      message: "Task fetched successfully",
      data: task,
    });
  });

  // Tasks: Create
  app.post("/api/v1/tasks", (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req) || 1;
    const { title, description, category, priority, deadline, status } = req.body;

    if (!title || !category || !priority || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Title, category, priority, and deadline are required",
        data: null,
      });
    }

    const newTask: TaskRecord = {
      id: nextTaskId++,
      title,
      description: description || "",
      category,
      priority,
      status: status || "PENDING",
      deadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
    };

    tasks.unshift(newTask);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  });

  // Tasks: Update
  app.put("/api/v1/tasks/:id", (req: Request, res: Response) => {
    const taskId = parseInt(req.params.id, 10);
    const userId = getAuthenticatedUserId(req) || 1;
    const index = tasks.findIndex((t) => t.id === taskId && t.userId === userId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id: '${taskId}'`,
        data: null,
      });
    }

    const { title, description, category, priority, status, deadline } = req.body;

    tasks[index] = {
      ...tasks[index],
      title: title ?? tasks[index].title,
      description: description ?? tasks[index].description,
      category: category ?? tasks[index].category,
      priority: priority ?? tasks[index].priority,
      status: status ?? tasks[index].status,
      deadline: deadline ?? tasks[index].deadline,
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: "Task updated successfully",
      data: tasks[index],
    });
  });

  // Tasks: Delete
  app.delete("/api/v1/tasks/:id", (req: Request, res: Response) => {
    const taskId = parseInt(req.params.id, 10);
    const userId = getAuthenticatedUserId(req) || 1;
    const index = tasks.findIndex((t) => t.id === taskId && t.userId === userId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id: '${taskId}'`,
        data: null,
      });
    }

    tasks.splice(index, 1);
    // Also remove orphaned reminders
    for (let i = reminders.length - 1; i >= 0; i--) {
      if (reminders[i].taskId === taskId) {
        reminders.splice(i, 1);
      }
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
      data: null,
    });
  });

  // Tasks: Mark Completed
  app.patch("/api/v1/tasks/:id/complete", (req: Request, res: Response) => {
    const taskId = parseInt(req.params.id, 10);
    const userId = getAuthenticatedUserId(req) || 1;
    const task = tasks.find((t) => t.id === taskId && t.userId === userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id: '${taskId}'`,
        data: null,
      });
    }

    task.status = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    task.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Task status toggled to ${task.status}`,
      data: task,
    });
  });

  // Reminders: Get All
  app.get("/api/v1/reminders", (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req) || 1;
    const userTaskIds = new Set(tasks.filter((t) => t.userId === userId).map((t) => t.id));

    const enriched = reminders
      .filter((r) => userTaskIds.has(r.taskId))
      .map((r) => {
        const t = tasks.find((item) => item.id === r.taskId);
        return {
          ...r,
          taskTitle: t ? t.title : "Untitled Task",
          taskCategory: t?.category,
          taskPriority: t?.priority,
        };
      })
      .sort((a, b) => new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime());

    res.json({
      success: true,
      message: "Reminders fetched successfully",
      data: enriched,
    });
  });

  // Reminders: Create
  app.post("/api/v1/reminders", (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req) || 1;
    const { reminderTime, reminderMessage, taskId } = req.body;

    if (!reminderTime || !reminderMessage || !taskId) {
      return res.status(400).json({
        success: false,
        message: "Reminder time, message, and task ID are required",
        data: null,
      });
    }

    const task = tasks.find((t) => t.id === Number(taskId) && t.userId === userId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id: '${taskId}'`,
        data: null,
      });
    }

    const newReminder: ReminderRecord = {
      id: nextReminderId++,
      reminderTime,
      reminderMessage,
      reminderStatus: "PENDING",
      taskId: Number(taskId),
    };

    reminders.push(newReminder);

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      data: {
        ...newReminder,
        taskTitle: task.title,
        taskCategory: task.category,
        taskPriority: task.priority,
      },
    });
  });

  // Reminders: Update
  app.put("/api/v1/reminders/:id", (req: Request, res: Response) => {
    const reminderId = parseInt(req.params.id, 10);
    const userId = getAuthenticatedUserId(req) || 1;
    const reminder = reminders.find((r) => r.id === reminderId);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: `Reminder not found with id: '${reminderId}'`,
        data: null,
      });
    }

    const task = tasks.find((t) => t.id === reminder.taskId && t.userId === userId);
    if (!task) {
      return res.status(403).json({ success: false, message: "Unauthorized", data: null });
    }

    const { reminderTime, reminderMessage, reminderStatus } = req.body;
    if (reminderTime) reminder.reminderTime = reminderTime;
    if (reminderMessage) reminder.reminderMessage = reminderMessage;
    if (reminderStatus) reminder.reminderStatus = reminderStatus;

    res.json({
      success: true,
      message: "Reminder updated successfully",
      data: {
        ...reminder,
        taskTitle: task.title,
      },
    });
  });

  // Reminders: Dismiss
  app.patch("/api/v1/reminders/:id/dismiss", (req: Request, res: Response) => {
    const reminderId = parseInt(req.params.id, 10);
    const reminder = reminders.find((r) => r.id === reminderId);
    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found", data: null });
    }
    reminder.reminderStatus = "DISMISSED";
    res.json({
      success: true,
      message: "Reminder dismissed",
      data: reminder,
    });
  });

  // Reminders: Delete
  app.delete("/api/v1/reminders/:id", (req: Request, res: Response) => {
    const reminderId = parseInt(req.params.id, 10);
    const index = reminders.findIndex((r) => r.id === reminderId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Reminder not found with id: '${reminderId}'`,
        data: null,
      });
    }

    reminders.splice(index, 1);
    res.json({
      success: true,
      message: "Reminder deleted successfully",
      data: null,
    });
  });

  // Notifications
  app.get("/api/v1/notifications", (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications.slice(0, 30),
    });
  });

  app.post("/api/v1/notifications/clear", (req: Request, res: Response) => {
    notifications.forEach((n) => (n.read = true));
    res.json({
      success: true,
      message: "Notifications marked as read",
      data: notifications,
    });
  });

  // Manual trigger for @Scheduled job
  app.post("/api/v1/scheduler/trigger", (req: Request, res: Response) => {
    const result = runScheduledJobs();
    res.json({
      success: true,
      message: `Background scheduler executed. Reminders triggered: ${result.remindersProcessed}, Tasks flagged overdue: ${result.tasksOverdue}`,
      data: result,
    });
  });

  // Raw JDBC Transaction Simulation Endpoint
  app.post("/api/v1/jdbc/simulate-transaction", (req: Request, res: Response) => {
    const { shouldFail, title, deadline, reminderMessage } = req.body;
    const userId = getAuthenticatedUserId(req) || 1;

    if (shouldFail) {
      // Rollback simulation
      return res.status(400).json({
        success: false,
        message: "JDBC Transaction Rolled Back! An exception occurred during reminder insertion. Neither Task nor Reminder was persisted to MySQL.",
        data: {
          connAutoCommit: false,
          rollbackTriggered: true,
          taskInserted: false,
          reminderInserted: false,
        },
      });
    }

    // Commit simulation
    const newTask: TaskRecord = {
      id: nextTaskId++,
      title: title || "Transaction Safe Task",
      description: "Created using raw TaskJdbcDAO atomic transaction.",
      category: "WORK",
      priority: "HIGH",
      status: "PENDING",
      deadline: deadline || getRelativeIso(24),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
    };
    tasks.unshift(newTask);

    const newReminder: ReminderRecord = {
      id: nextReminderId++,
      reminderTime: deadline || getRelativeIso(12),
      reminderMessage: reminderMessage || `Atomic notification for: ${newTask.title}`,
      reminderStatus: "PENDING",
      taskId: newTask.id,
    };
    reminders.unshift(newReminder);

    res.json({
      success: true,
      message: "JDBC Transaction Committed successfully! Both Task and Reminder were saved in a single atomic unit of work.",
      data: {
        connAutoCommit: false,
        commitExecuted: true,
        task: newTask,
        reminder: newReminder,
      },
    });
  });

  // Syllabus mapping API for interactive exploration
  app.get("/api/v1/syllabus/map", (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Syllabus mapping fetched successfully",
      data: [
        {
          module: "JDBC Architecture",
          topics: ["Connection", "PreparedStatement", "ResultSet", "Transactions (Commit/Rollback)"],
          implementation: "TaskJdbcDAO.java, JdbcConnectionUtil.java",
          status: "Implemented & Active",
        },
        {
          module: "Servlets API",
          topics: ["HttpServlet", "GenericServlet", "RequestDispatcher forward", "sendRedirect()"],
          implementation: "TaskExportServlet.java, WelcomeGenericServlet.java, RequestDispatcherDemoServlet.java",
          status: "Implemented & Active",
        },
        {
          module: "Session & Cookies",
          topics: ["HttpSession management", "Cookie read/write (LAST_VISIT)", "Session invalidation"],
          implementation: "SessionUtil.java, AuthController.java, SecurityConfig.java",
          status: "Implemented & Active",
        },
        {
          module: "Dependency Injection",
          topics: ["Constructor Injection (@RequiredArgsConstructor)", "Setter Injection", "Field Injection (@Autowired)"],
          implementation: "TaskServiceImpl.java, UserServiceImpl.java",
          status: "Implemented & Active",
        },
        {
          module: "Spring Data JPA & Hibernate",
          topics: ["Entity Mapping (@Entity, @Table, @OneToMany, @ManyToOne)", "JPQL Custom Queries", "Cascade & Lifecycle Hooks (@PrePersist)"],
          implementation: "User.java, Task.java, Reminder.java, TaskRepository.java, ReminderRepository.java",
          status: "Implemented & Active",
        },
        {
          module: "Spring Security",
          topics: ["BCryptPasswordEncoder", "SecurityFilterChain", "CustomUserDetails & UserDetailsService"],
          implementation: "SecurityConfig.java, CustomUserDetails.java, CustomUserDetailsService.java",
          status: "Implemented & Active",
        },
        {
          module: "Automated Scheduler",
          topics: ["@EnableScheduling", "@Scheduled(fixedRate = ...)", "Overdue task detection & dispatch"],
          implementation: "ReminderScheduler.java, AppConfig.java",
          status: "Implemented & Active",
        },
        {
          module: "Exception Handling & REST",
          topics: ["@RestControllerAdvice", "GlobalExceptionHandler", "Standardized ApiResponse<T> envelope"],
          implementation: "GlobalExceptionHandler.java, ApiResponse.java, ErrorResponse.java",
          status: "Implemented & Active",
        },
      ],
    });
  });

  // -------------------------------------------------------------
  // Vite Middleware Setup
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Task Scheduler & Reminder Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
