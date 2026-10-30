export type TaskCategory = 'STUDY' | 'WORK' | 'PERSONAL' | 'HEALTH' | 'OTHER';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type ReminderStatus = 'PENDING' | 'SENT' | 'DISMISSED';

export interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface Reminder {
  id: number;
  reminderTime: string;
  reminderMessage: string;
  reminderStatus: ReminderStatus;
  taskId: number;
  taskTitle?: string;
  taskCategory?: TaskCategory;
  taskPriority?: TaskPriority;
}

export interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  completionPercentage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  type: 'REMINDER' | 'OVERDUE' | 'INFO';
  title: string;
  message: string;
  read: boolean;
}
