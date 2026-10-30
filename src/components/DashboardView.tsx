import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Flame, 
  ListTodo, 
  PlayCircle, 
  Plus, 
  ArrowRight, 
  Bell, 
  Calendar, 
  FolderKanban,
  Check
} from 'lucide-react';
import { DashboardStats, Task, Reminder, User } from '../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  tasks: Task[];
  reminders: Reminder[];
  user: User | null;
  onNavigate: (tab: string) => void;
  onOpenAddTask: () => void;
  onOpenAddReminder: () => void;
  onToggleTaskComplete: (taskId: number) => void;
  onTriggerScheduler: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  tasks,
  reminders,
  user,
  onNavigate,
  onOpenAddTask,
  onOpenAddReminder,
  onToggleTaskComplete,
  onTriggerScheduler,
}) => {
  const overdueTasks = tasks.filter((t) => t.status === 'OVERDUE');
  const pendingOrInProgress = tasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  const urgentTasks = tasks
    .filter((t) => t.status !== 'COMPLETED' && (t.priority === 'HIGH' || t.status === 'OVERDUE'))
    .slice(0, 5);

  const upcomingReminders = reminders
    .filter((r) => r.reminderStatus === 'PENDING')
    .sort((a, b) => new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime())
    .slice(0, 4);

  // Category counts
  const categoryCounts = {
    WORK: tasks.filter((t) => t.category === 'WORK').length,
    STUDY: tasks.filter((t) => t.category === 'STUDY').length,
    PERSONAL: tasks.filter((t) => t.category === 'PERSONAL').length,
    HEALTH: tasks.filter((t) => t.category === 'HEALTH').length,
    OTHER: tasks.filter((t) => t.category === 'OTHER').length,
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-200 border-rose-200 dark:border-rose-800';
      case 'MEDIUM':
        return 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'WORK':
        return 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800';
      case 'STUDY':
        return 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-200 border-purple-200 dark:border-purple-800';
      case 'HEALTH':
        return 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800';
      case 'PERSONAL':
        return 'bg-orange-50 dark:bg-orange-950/70 text-orange-700 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-400/20">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {user ? user.fullName.split(' ')[0] : 'there'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Plan it. Do it. On time. Stay organized with priority deadlines and automated reminders.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddTask}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
            <button
              onClick={onOpenAddReminder}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 backdrop-blur-sm transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              Set Reminder
            </button>
            <button
              onClick={onTriggerScheduler}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-white text-sm font-medium border border-indigo-400/30 backdrop-blur-sm transition-all cursor-pointer"
              title="Executes @Scheduled background worker immediately"
            >
              <Clock className="w-4 h-4" />
              Run Scheduler
            </button>
          </div>
        </div>

        {/* Decorative subtle ambient lights */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Tasks */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <ListTodo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalTasks ?? tasks.length}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Across all categories</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats?.pendingTasks ?? 0}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Awaiting start</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <PlayCircle className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats?.inProgressTasks ?? 0}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Active execution</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats?.completedTasks ?? 0}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Successfully finished</p>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats?.overdueTasks ?? 0}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Past deadline</p>
          </div>
        </div>

        {/* High Priority */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High Priority</span>
            <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.highPriorityTasks ?? 0}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Urgent priority</p>
          </div>
        </div>

      </div>

      {/* Completion Progress Bar Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Task Completion Rate</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time progress calculated across all active tasks</p>
          </div>
          <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
            {stats ? stats.completionPercentage : 0}%
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
          <div 
            className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, stats?.completionPercentage || 0))}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Urgent Tasks & Upcoming Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Urgent & Active Tasks (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-600" />
                  Urgent & Active Tasks
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">High priority or overdue items requiring immediate action</p>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
              >
                View all tasks
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {urgentTasks.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All clear!</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">No overdue or high priority pending tasks right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {urgentTasks.map((t) => {
                  const isOverdue = t.status === 'OVERDUE';
                  const deadlineDate = new Date(t.deadline);
                  const isToday = deadlineDate.toDateString() === new Date().toDateString();

                  return (
                    <div key={t.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group">
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => onToggleTaskComplete(t.id)}
                          className="mt-0.5 w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:border-emerald-500 hover:bg-emerald-50 text-transparent hover:text-emerald-600 transition-colors shrink-0"
                          title="Mark complete"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {t.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadge(t.priority)}`}>
                              {t.priority}
                            </span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getCategoryBadge(t.category)}`}>
                              {t.category}
                            </span>
                            <span className={`text-[11px] flex items-center gap-1 ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                              <Clock className="w-3 h-3" />
                              {isOverdue ? 'Overdue: ' : 'Due: '}
                              {deadlineDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold shrink-0 ${
                        isOverdue 
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' 
                          : t.status === 'IN_PROGRESS' 
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' 
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Distribution Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-purple-600" />
              Category Workload Distribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <div key={cat} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/80 text-center">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">{cat}</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{count}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 block">tasks</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Reminders Sidebar (1 Column) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  Scheduled Reminders
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Upcoming automated notifications</p>
              </div>
              <button
                onClick={() => onNavigate('reminders')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No pending reminders</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Add reminders to trigger background notifications.</p>
                <button
                  onClick={onOpenAddReminder}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Reminder
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingReminders.map((r) => {
                  const remTime = new Date(r.reminderTime);
                  const isPast = remTime <= new Date();

                  return (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span className="font-semibold text-blue-700 dark:text-blue-400 truncate max-w-[170px]">
                          {r.taskTitle || `Task #${r.taskId}`}
                        </span>
                        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${isPast ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                          {remTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">
                        {r.reminderMessage}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
                        <span>Scheduled: {remTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">Pending trigger</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* On Time Productivity Advice */}
          <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 dark:from-slate-850 dark:to-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              On Time Daily Rhythm
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              - Break larger deliverables down into actionable priority items.
              <br />
              - Set reminders 15–30 minutes before crucial deadlines.
              <br />
              - Review overdue and high-priority tasks first each morning.
            </p>
            <button
              onClick={() => onNavigate('tasks')}
              className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors"
            >
              Organize Tasks Now
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
