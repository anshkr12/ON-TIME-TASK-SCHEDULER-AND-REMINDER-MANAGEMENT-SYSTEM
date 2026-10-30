import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  Send,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Reminder, ReminderStatus, Task } from '../types';

interface ReminderListViewProps {
  reminders: Reminder[];
  tasks: Task[];
  onOpenAddReminder: () => void;
  onDismissReminder: (id: number) => void;
  onDeleteReminder: (id: number) => void;
  onTriggerScheduler: () => void;
  isSchedulerRunning: boolean;
  lastSchedulerRunMessage?: string | null;
}

export const ReminderListView: React.FC<ReminderListViewProps> = ({
  reminders,
  tasks,
  onOpenAddReminder,
  onDismissReminder,
  onDeleteReminder,
  onTriggerScheduler,
  isSchedulerRunning,
  lastSchedulerRunMessage,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredReminders = reminders.filter((r) => {
    if (statusFilter !== 'ALL' && r.reminderStatus !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: ReminderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800';
      case 'SENT':
        return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800';
      case 'DISMISSED':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Reminders & Notifications</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated alerts and notifications to keep your schedule on track
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onTriggerScheduler}
            disabled={isSchedulerRunning}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition-colors cursor-pointer"
            title="Force immediate check for due reminders & overdue tasks"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isSchedulerRunning ? 'animate-spin' : ''}`} />
            <span>{isSchedulerRunning ? 'Executing...' : 'Trigger Scheduler'}</span>
          </button>

          <button
            onClick={onOpenAddReminder}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Reminder</span>
          </button>
        </div>
      </div>

      {/* Scheduler Info & Status Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Automated Alert Dispatcher Active
            </span>
          </div>
          <p className="text-sm text-slate-200">
            Automatically inspects reminders due and dispatches notification alerts, keeping deadlines visible and tasks on schedule.
          </p>
          {lastSchedulerRunMessage && (
            <p className="text-xs text-blue-200 font-mono bg-white/10 px-2.5 py-1 rounded inline-block mt-2">
              Latest Run: {lastSchedulerRunMessage}
            </p>
          )}
        </div>

        <button
          onClick={onTriggerScheduler}
          disabled={isSchedulerRunning}
          className="px-4 py-2 rounded-lg bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold transition-colors shrink-0 shadow cursor-pointer"
        >
          Run Worker Check Now
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider mr-2">Filter:</span>
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            statusFilter === 'ALL' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All ({reminders.length})
        </button>
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            statusFilter === 'PENDING' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Pending ({reminders.filter((r) => r.reminderStatus === 'PENDING').length})
        </button>
        <button
          onClick={() => setStatusFilter('SENT')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            statusFilter === 'SENT' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Dispatched ({reminders.filter((r) => r.reminderStatus === 'SENT').length})
        </button>
        <button
          onClick={() => setStatusFilter('DISMISSED')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            statusFilter === 'DISMISSED' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Dismissed ({reminders.filter((r) => r.reminderStatus === 'DISMISSED').length})
        </button>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-12 text-center transition-colors">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No reminders found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Schedule a reminder for any existing task to receive notifications before deadlines expire.
          </p>
          <button
            onClick={onOpenAddReminder}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule First Reminder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReminders.map((reminder) => {
            const reminderDate = new Date(reminder.reminderTime);
            const isDueOrPast = reminderDate <= new Date();
            const isPending = reminder.reminderStatus === 'PENDING';

            return (
              <div
                key={reminder.id}
                className={`bg-white dark:bg-slate-900 rounded-xl border p-4.5 flex flex-col justify-between shadow-xs transition-all ${
                  isPending && isDueOrPast
                    ? 'border-amber-300 dark:border-amber-600/70 ring-2 ring-amber-100 dark:ring-amber-900/30'
                    : 'border-slate-200/90 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Reminder #{reminder.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(reminder.reminderStatus)}`}>
                      {reminder.reminderStatus}
                    </span>
                  </div>

                  {/* Target Task Title */}
                  <div className="mb-2">
                    <span className="text-[11px] font-medium text-slate-400 block">Associated Task:</span>
                    <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 line-clamp-1 hover:underline cursor-pointer">
                      {reminder.taskTitle || `Task #${reminder.taskId}`}
                    </h3>
                  </div>

                  {/* Message */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/80 mb-3 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    "{reminder.reminderMessage}"
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {reminderDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                      {reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {reminder.reminderStatus !== 'DISMISSED' && (
                      <button
                        onClick={() => onDismissReminder(reminder.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Dismiss reminder"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteReminder(reminder.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
