import React, { useState, useEffect, useCallback } from 'react';
import { api } from './lib/api';
import { User, Task, Reminder, DashboardStats, NotificationLog } from './types';
import { Navbar } from './components/Navbar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { DashboardView } from './components/DashboardView';
import { TaskListView } from './components/TaskListView';
import { CalendarView } from './components/CalendarView';
import { TaskModal } from './components/TaskModal';
import { ReminderListView } from './components/ReminderListView';
import { ReminderModal } from './components/ReminderModal';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<User | null>({
    id: 1,
    fullName: 'Jane Doe',
    email: 'demo@taskscheduler.com',
    createdAt: new Date().toISOString(),
  });

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ontime_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('ontime_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('ontime_theme', 'light');
      }
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskInitialDeadline, setTaskInitialDeadline] = useState<string | undefined>(undefined);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderInitialTaskId, setReminderInitialTaskId] = useState<number | null>(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Scheduler status
  const [isSchedulerRunning, setIsSchedulerRunning] = useState(false);
  const [lastSchedulerMessage, setLastSchedulerMessage] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all data
  const loadData = useCallback(async () => {
    try {
      const [statsRes, tasksRes, remindersRes, notifsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getTasks(),
        api.getReminders(),
        api.getNotifications(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (remindersRes.success) setReminders(remindersRes.data);
      if (notifsRes.success) setNotifications(notifsRes.data);
    } catch (err) {
      console.error('Failed to load system data', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();

    // Check auth status
    api.getCurrentUser().then((res) => {
      if (res.success && res.data) {
        setUser(res.data);
      }
    }).catch(() => {});

    // Periodic polling to sync notifications & scheduler updates every 15s
    const interval = setInterval(() => {
      loadData();
    }, 15000);

    return () => clearInterval(interval);
  }, [loadData]);

  // Task Actions
  const handleOpenAddTask = (initialDeadline?: string) => {
    setTaskToEdit(null);
    setTaskInitialDeadline(initialDeadline);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskToEdit(task);
    setTaskInitialDeadline(undefined);
    setIsTaskModalOpen(true);
  };

  const handleSubmitTask = async (taskData: Partial<Task>) => {
    try {
      if (taskToEdit) {
        const res = await api.updateTask(taskToEdit.id, taskData);
        if (res.success) {
          addToast('success', 'Task Updated', `"${res.data.title}" updated successfully.`);
          setIsTaskModalOpen(false);
          loadData();
        } else {
          addToast('error', 'Update Failed', res.message);
        }
      } else {
        const res = await api.createTask(taskData);
        if (res.success) {
          addToast('success', 'Task Created', `"${res.data.title}" added to schedule.`);
          setIsTaskModalOpen(false);
          loadData();
        } else {
          addToast('error', 'Creation Failed', res.message);
        }
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task? Associated reminders will also be deleted.')) {
      return;
    }
    try {
      const res = await api.deleteTask(taskId);
      if (res.success) {
        addToast('info', 'Task Deleted', 'Task and associated reminders removed.');
        loadData();
      }
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
    }
  };

  const handleToggleTaskComplete = async (taskId: number) => {
    try {
      const res = await api.toggleComplete(taskId);
      if (res.success) {
        addToast('success', 'Status Updated', `Task status toggled to ${res.data.status}`);
        loadData();
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  // Reminder Actions
  const handleOpenAddReminder = (task?: Task) => {
    if (task) {
      setReminderInitialTaskId(task.id);
    } else if (tasks.length > 0) {
      setReminderInitialTaskId(tasks[0].id);
    } else {
      setReminderInitialTaskId(null);
    }
    setIsReminderModalOpen(true);
  };

  const handleSubmitReminder = async (data: {
    taskId: number;
    reminderTime: string;
    reminderMessage: string;
  }) => {
    try {
      const res = await api.createReminder(data);
      if (res.success) {
        addToast('success', 'Reminder Scheduled', res.data.reminderMessage);
        setIsReminderModalOpen(false);
        loadData();
      } else {
        addToast('error', 'Failed', res.message);
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleDismissReminder = async (id: number) => {
    try {
      const res = await api.dismissReminder(id);
      if (res.success) {
        addToast('info', 'Reminder Dismissed', 'Marked as dismissed.');
        loadData();
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleDeleteReminder = async (id: number) => {
    try {
      const res = await api.deleteReminder(id);
      if (res.success) {
        addToast('info', 'Reminder Deleted', 'Reminder removed.');
        loadData();
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  // Scheduler Trigger Action
  const handleTriggerScheduler = async () => {
    setIsSchedulerRunning(true);
    try {
      const res = await api.triggerScheduler();
      if (res.success) {
        setLastSchedulerMessage(res.message);
        addToast(
          'info',
          'Scheduler Executed',
          `Processed ${res.data.remindersProcessed} due reminders, flagged ${res.data.tasksOverdue} overdue tasks.`
        );
        loadData();
      }
    } catch (err: any) {
      addToast('error', 'Scheduler Error', err.message);
    } finally {
      setIsSchedulerRunning(false);
    }
  };

  // Task Export (HttpServlet + raw JDBC)
  const handleExportTasks = async () => {
    try {
      const text = await api.getExportTasks();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks-export-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('success', 'Export Complete', 'Task list exported via HttpServlet stream.');
    } catch (err: any) {
      addToast('error', 'Export Failed', err.message);
    }
  };

  // Auth Handlers
  const handleAuthSuccess = (authUser: User) => {
    setUser(authUser);
    addToast('success', 'Welcome', `Signed in as ${authUser.fullName}`);
    loadData();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      addToast('info', 'Signed Out', 'You have been signed out.');
      setIsAuthModalOpen(true);
    } catch (err: any) {
      addToast('error', 'Logout Error', err.message);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await api.clearNotifications();
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900 transition-colors">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        notifications={notifications}
        onToggleNotifications={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
        onTriggerScheduler={handleTriggerScheduler}
        isSchedulerRunning={isSchedulerRunning}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            tasks={tasks}
            reminders={reminders}
            user={user}
            onNavigate={setActiveTab}
            onOpenAddTask={handleOpenAddTask}
            onOpenAddReminder={() => handleOpenAddReminder()}
            onToggleTaskComplete={handleToggleTaskComplete}
            onTriggerScheduler={handleTriggerScheduler}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskListView
            tasks={tasks}
            onOpenAddTask={handleOpenAddTask}
            onEditTask={handleOpenEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleComplete={handleToggleTaskComplete}
            onAddReminderForTask={handleOpenAddReminder}
            onExportTasks={handleExportTasks}
            isLoading={false}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            reminders={reminders}
            onOpenAddTask={handleOpenAddTask}
            onOpenAddReminder={(task) => handleOpenAddReminder(task?.id)}
            onEditTask={handleOpenEditTask}
            onToggleComplete={handleToggleTaskComplete}
          />
        )}

        {activeTab === 'reminders' && (
          <ReminderListView
            reminders={reminders}
            tasks={tasks}
            onOpenAddReminder={() => handleOpenAddReminder()}
            onDismissReminder={handleDismissReminder}
            onDeleteReminder={handleDeleteReminder}
            onTriggerScheduler={handleTriggerScheduler}
            isSchedulerRunning={isSchedulerRunning}
            lastSchedulerRunMessage={lastSchedulerMessage}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView user={user} stats={stats} onLogout={handleLogout} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">ON TIME</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">Plan it. Do it. On time.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <span>Intelligent Task & Reminder Management</span>
            <span>•</span>
            <span>Fast, Reliable & Always In Sync</span>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-overs */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onClear={handleClearNotifications}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleSubmitTask}
        taskToEdit={taskToEdit}
        initialDeadline={taskInitialDeadline}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        tasks={tasks}
        initialTaskId={reminderInitialTaskId}
        onSubmit={handleSubmitReminder}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
