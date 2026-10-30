import React, { useState, useEffect } from 'react';
import { X, Bell, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  initialTaskId?: number | null;
  onSubmit: (data: { taskId: number; reminderTime: string; reminderMessage: string }) => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  tasks,
  initialTaskId,
  onSubmit,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<number | ''>('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [error, setError] = useState('');

  // Default reminder: 2 hours from now
  const getDefaultDatetime = () => {
    const d = new Date(Date.now() + 2 * 3600000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (initialTaskId) {
      setSelectedTaskId(initialTaskId);
      const targetTask = tasks.find((t) => t.id === initialTaskId);
      if (targetTask) {
        setReminderMessage(`Reminder: Complete "${targetTask.title}" before deadline.`);
      }
    } else if (tasks.length > 0) {
      setSelectedTaskId(tasks[0].id);
      setReminderMessage(`Reminder: Review "${tasks[0].title}".`);
    }
    setReminderTime(getDefaultDatetime());
    setError('');
  }, [initialTaskId, tasks, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) {
      setError('Please select an associated task');
      return;
    }
    if (!reminderTime) {
      setError('Please select reminder trigger time');
      return;
    }
    if (!reminderMessage.trim()) {
      setError('Please enter a reminder message');
      return;
    }

    onSubmit({
      taskId: Number(selectedTaskId),
      reminderTime: new Date(reminderTime).toISOString(),
      reminderMessage: reminderMessage.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Schedule Reminder</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Associate an automated alert with a task</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Task */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Associated Task <span className="text-rose-500">*</span>
            </label>
            {tasks.length === 0 ? (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/40">
                You must have at least one task to schedule a reminder.
              </p>
            ) : (
              <select
                value={selectedTaskId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedTaskId(id);
                  const t = tasks.find((item) => item.id === id);
                  if (t) {
                    setReminderMessage(`Reminder: Work on "${t.title}".`);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    [#{task.id}] {task.title} ({task.priority} Priority, Due: {new Date(task.deadline).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Reminder Trigger Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Trigger Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Automated scheduler polls periodically and dispatches an alert when this time arrives.
            </p>
          </div>

          {/* Reminder Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reminder Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Enter message to display when notification triggers..."
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={tasks.length === 0}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Schedule Reminder
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
