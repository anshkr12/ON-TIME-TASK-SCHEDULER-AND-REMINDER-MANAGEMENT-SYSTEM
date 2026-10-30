import { Task, Reminder, DashboardStats, User, ApiResponse, NotificationLog } from '../types';

export const api = {
  // Auth
  async login(email: string, password: string):Promise<ApiResponse<User & { token: string }>> {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(data: { fullName: string; email: string; password: string; confirmPassword: string }): Promise<ApiResponse<User & { token: string }>> {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const res = await fetch('/api/v1/auth/me');
    return res.json();
  },

  async logout(): Promise<ApiResponse<void>> {
    const res = await fetch('/api/v1/auth/logout', { method: 'POST' });
    return res.json();
  },

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const res = await fetch('/api/v1/dashboard/stats');
    return res.json();
  },

  // Tasks
  async getTasks(params?: {
    keyword?: string;
    status?: string;
    priority?: string;
    category?: string;
    sortBy?: string;
    direction?: string;
  }): Promise<ApiResponse<Task[]>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'ALL') query.append(key, val);
      });
    }
    const res = await fetch(`/api/v1/tasks?${query.toString()}`);
    return res.json();
  },

  async getTaskById(id: number): Promise<ApiResponse<Task>> {
    const res = await fetch(`/api/v1/tasks/${id}`);
    return res.json();
  },

  async createTask(taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    const res = await fetch('/api/v1/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    return res.json();
  },

  async updateTask(id: number, taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    const res = await fetch(`/api/v1/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    return res.json();
  },

  async deleteTask(id: number): Promise<ApiResponse<void>> {
    const res = await fetch(`/api/v1/tasks/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async toggleComplete(id: number): Promise<ApiResponse<Task>> {
    const res = await fetch(`/api/v1/tasks/${id}/complete`, {
      method: 'PATCH',
    });
    return res.json();
  },

  async getOverdueTasks(): Promise<ApiResponse<Task[]>> {
    const res = await fetch('/api/v1/tasks/overdue');
    return res.json();
  },

  // Reminders
  async getReminders(): Promise<ApiResponse<Reminder[]>> {
    const res = await fetch('/api/v1/reminders');
    return res.json();
  },

  async createReminder(data: {
    reminderTime: string;
    reminderMessage: string;
    taskId: number;
  }): Promise<ApiResponse<Reminder>> {
    const res = await fetch('/api/v1/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateReminder(id: number, data: Partial<Reminder>): Promise<ApiResponse<Reminder>> {
    const res = await fetch(`/api/v1/reminders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async dismissReminder(id: number): Promise<ApiResponse<Reminder>> {
    const res = await fetch(`/api/v1/reminders/${id}/dismiss`, {
      method: 'PATCH',
    });
    return res.json();
  },

  async deleteReminder(id: number): Promise<ApiResponse<void>> {
    const res = await fetch(`/api/v1/reminders/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Scheduler & Notifications
  async triggerScheduler(): Promise<ApiResponse<{ remindersProcessed: number; tasksOverdue: number }>> {
    const res = await fetch('/api/v1/scheduler/trigger', { method: 'POST' });
    return res.json();
  },

  async getNotifications(): Promise<ApiResponse<NotificationLog[]>> {
    const res = await fetch('/api/v1/notifications');
    return res.json();
  },

  async clearNotifications(): Promise<ApiResponse<NotificationLog[]>> {
    const res = await fetch('/api/v1/notifications/clear', { method: 'POST' });
    return res.json();
  },

  // Servlet Demos
  async getPing(): Promise<string> {
    const res = await fetch('/ping');
    return res.text();
  },

  async getExportTasks(): Promise<string> {
    const res = await fetch('/export/tasks');
    return res.text();
  },

  async simulateTransaction(shouldFail: boolean, title?: string, reminderMessage?: string): Promise<any> {
    const res = await fetch('/api/v1/jdbc/simulate-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shouldFail, title, reminderMessage }),
    });
    return res.json();
  },
};
