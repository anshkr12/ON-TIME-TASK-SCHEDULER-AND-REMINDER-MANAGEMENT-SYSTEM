import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Bell, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Check, 
  ArrowUpRight,
  Sparkles,
  CalendarDays
} from 'lucide-react';
import { Task, Reminder, TaskCategory, TaskPriority, TaskStatus } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  reminders: Reminder[];
  onOpenAddTask: (datePrefill?: string) => void;
  onOpenAddReminder: (task?: Task) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: number) => void;
}

type CalendarViewMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  reminders,
  onOpenAddTask,
  onOpenAddReminder,
  onEditTask,
  onToggleComplete,
}) => {
  // Navigation State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Helper date utilities
  const today = useMemo(() => new Date(), []);

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (date: Date) => isSameDay(date, today);

  // Map reminders to taskId set for fast lookup
  const tasksWithReminders = useMemo(() => {
    const set = new Set<number>();
    reminders.forEach((r) => {
      if (r.reminderStatus === 'PENDING') {
        set.add(r.taskId);
      }
    });
    return set;
  }, [reminders]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
      if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) return false;
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'OVERDUE') {
          const isOverdue = t.status === 'OVERDUE' || (t.status !== 'COMPLETED' && new Date(t.deadline).getTime() < Date.now());
          if (!isOverdue) return false;
        } else if (t.status !== selectedStatus) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, searchQuery, selectedCategory, selectedPriority, selectedStatus]);

  // KPI Summary Metrics
  const summaryMetrics = useMemo(() => {
    const now = Date.now();
    const todayTasks = tasks.filter((t) => isSameDay(new Date(t.deadline), today));
    const upcomingTasks = tasks.filter((t) => t.status !== 'COMPLETED' && new Date(t.deadline).getTime() > now);
    const overdueTasks = tasks.filter((t) => t.status === 'OVERDUE' || (t.status !== 'COMPLETED' && new Date(t.deadline).getTime() < now));
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

    return {
      todayCount: todayTasks.length,
      upcomingCount: upcomingTasks.length,
      overdueCount: overdueTasks.length,
      completedCount: completedTasks.length,
    };
  }, [tasks, today]);

  // Today's schedule items for right sidebar
  const todayScheduleTasks = useMemo(() => {
    return tasks
      .filter((t) => isSameDay(new Date(t.deadline), today))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks, today]);

  // Upcoming deadlines (next 4)
  const upcomingDeadlines = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((t) => t.status !== 'COMPLETED' && new Date(t.deadline).getTime() >= now)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 4);
  }, [tasks]);

  // Upcoming reminders (next 4)
  const upcomingRemindersList = useMemo(() => {
    return reminders
      .filter((r) => r.reminderStatus === 'PENDING')
      .sort((a, b) => new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime())
      .slice(0, 4);
  }, [reminders]);

  // Calendar Navigation
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  // Format header title based on viewMode
  const calendarTitle = useMemo(() => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    }
    // Week title
    const curr = new Date(currentDate);
    const dayOfWeek = (curr.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - dayOfWeek);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monMonth = monday.toLocaleDateString(undefined, { month: 'short' });
    const sunMonth = sunday.toLocaleDateString(undefined, { month: 'short' });

    if (monMonth === sunMonth) {
      return `${monMonth} ${monday.getDate()} – ${sunday.getDate()}, ${sunday.getFullYear()}`;
    }
    return `${monMonth} ${monday.getDate()} – ${sunMonth} ${sunday.getDate()}, ${sunday.getFullYear()}`;
  }, [currentDate, viewMode]);

  // Month grid calculation (Monday start)
  const monthGridDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday as first day: 0 = Mon, ..., 6 = Sun
    const startDay = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDays = lastDayOfMonth.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Preceding month padding
    for (let i = startDay; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Trailing padding to make full 7-day grid (35 or 42 cells)
    const remainder = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainder; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  // Week days calculation (Monday to Sunday)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = (curr.getDay() + 6) % 7; // Mon = 0
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - dayOfWeek);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Format date to ISO string for pre-filling Add Task
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    onOpenAddTask(d.toISOString());
  };

  // Helper styling for category badge
  const getCategoryStyles = (category: TaskCategory) => {
    switch (category) {
      case 'STUDY':
        return 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-200 border-purple-200 dark:border-purple-800/80';
      case 'WORK':
        return 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800/80';
      case 'HEALTH':
        return 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/80';
      case 'PERSONAL':
        return 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/80';
      case 'OTHER':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    }
  };

  const getPriorityDot = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-500 ring-rose-300';
      case 'MEDIUM':
        return 'bg-amber-500 ring-amber-300';
      case 'LOW':
      default:
        return 'bg-emerald-500 ring-emerald-300';
    }
  };

  const formatTaskTime = (deadline: string) => {
    try {
      const d = new Date(deadline);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25 shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Calendar
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Plan your tasks, deadlines and reminders in one place.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenAddReminder()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Set Reminder</span>
          </button>

          <button
            onClick={() => onOpenAddTask()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      {/* 2. Smart Calendar Summary (4 KPI Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Today's Tasks</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{summaryMetrics.todayCount}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">scheduled</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Upcoming</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{summaryMetrics.upcomingCount}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">deliverables</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Overdue</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-300 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{summaryMetrics.overdueCount}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">need action</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Completed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summaryMetrics.completedCount}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">finished</span>
          </div>
        </div>
      </div>

      {/* 3. Calendar Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks across calendar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden lg:inline">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All Categories</option>
                <option value="WORK">Work</option>
                <option value="STUDY">Study</option>
                <option value="HEALTH">Health</option>
                <option value="PERSONAL">Personal</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden lg:inline">Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden lg:inline">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>

            {(searchQuery || selectedCategory !== 'ALL' || selectedPriority !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setSelectedPriority('ALL');
                  setSelectedStatus('ALL');
                }}
                className="px-2.5 py-2 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Calendar Toolbar & Main Display Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Calendar Card (8 or 9 cols on desktop) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          
          {/* Calendar Toolbar Card */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Navigation Buttons + Month Title */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={handleToday}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                Today
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {calendarTitle}
              </h2>
            </div>

            {/* View Selector (Month / Week / Day) */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Day
              </button>
            </div>

          </div>

          {/* MAIN CALENDAR DISPLAY */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            
            {/* VIEW: MONTH */}
            {viewMode === 'month' && (
              <div>
                {/* 7 Column Headers (Monday to Sunday) */}
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-center py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div className="text-blue-600 dark:text-blue-400">Sat</div>
                  <div className="text-rose-600 dark:text-rose-400">Sun</div>
                </div>

                {/* Grid Cells */}
                <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 dark:divide-slate-800 bg-slate-200 dark:bg-slate-800">
                  {monthGridDays.map((cell, idx) => {
                    const dayTasks = filteredTasks.filter((t) => isSameDay(new Date(t.deadline), cell.date));
                    const isCurrentDay = isToday(cell.date);
                    const isSelected = isSameDay(cell.date, selectedDate);

                    return (
                      <div
                        key={idx}
                        onClick={() => handleDateClick(cell.date)}
                        className={`min-h-[110px] sm:min-h-[125px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors group cursor-pointer ${
                          !cell.isCurrentMonth
                            ? 'bg-slate-50/80 dark:bg-slate-950/80 text-slate-400 dark:text-slate-500'
                            : isSelected
                            ? 'bg-blue-50/60 dark:bg-blue-950/50 text-slate-900 dark:text-white'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-900 dark:text-white'
                        }`}
                      >
                        {/* Day Number Row */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-transform ${
                              isCurrentDay
                                ? 'bg-blue-600 text-white font-bold shadow-xs scale-105'
                                : cell.isCurrentMonth
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {cell.date.getDate()}
                          </span>

                          {dayTasks.length > 0 && (
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                            </span>
                          )}
                        </div>

                        {/* Tasks in this Day */}
                        <div className="mt-1.5 space-y-1 overflow-hidden flex-1">
                          {dayTasks.slice(0, 3).map((task) => {
                            const hasReminder = tasksWithReminders.has(task.id);
                            const isOverdue = task.status === 'OVERDUE' || (task.status !== 'COMPLETED' && new Date(task.deadline).getTime() < Date.now());
                            const isCompleted = task.status === 'COMPLETED';

                            return (
                              <div
                                key={task.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditTask(task);
                                }}
                                className={`text-[11px] p-1 rounded-md border flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer group/item ${getCategoryStyles(
                                  task.category
                                )} ${isCompleted ? 'opacity-60 line-through' : ''} ${
                                  isOverdue ? 'ring-1 ring-rose-400 dark:ring-rose-500' : ''
                                }`}
                                title={`${task.title} - ${task.priority} Priority (${formatTaskTime(task.deadline)})`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getPriorityDot(task.priority)}`} />
                                <span className="font-semibold truncate flex-1 leading-tight text-slate-900 dark:text-slate-100">
                                  {task.title}
                                </span>
                                {hasReminder && (
                                  <Bell className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400 shrink-0" />
                                )}
                              </div>
                            );
                          })}

                          {dayTasks.length > 3 && (
                            <div className="text-[10px] font-bold text-blue-700 dark:text-blue-300 text-center py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded">
                              +{dayTasks.length - 3} more
                            </div>
                          )}
                        </div>

                        {/* Subtle Add hint on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-400 dark:text-slate-400 text-right pt-0.5 font-medium">
                          + Add
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW: WEEK */}
            {viewMode === 'week' && (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {/* 7 Days Columns / Grid */}
                <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 min-h-[500px]">
                  {weekDays.map((day, idx) => {
                    const dayTasks = filteredTasks.filter((t) => isSameDay(new Date(t.deadline), day));
                    const isCurrentDay = isToday(day);
                    const dayReminders = reminders.filter((r) => isSameDay(new Date(r.reminderTime), day));

                    return (
                      <div
                        key={idx}
                        onClick={() => handleDateClick(day)}
                        className={`p-3 flex flex-col transition-colors cursor-pointer ${
                          isCurrentDay
                            ? 'bg-blue-50/40 dark:bg-blue-950/40'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        {/* Day Header */}
                        <div className="pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                              {day.toLocaleDateString(undefined, { weekday: 'short' })}
                            </span>
                            <span className={`text-base font-bold ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                              {day.getDate()} {day.toLocaleDateString(undefined, { month: 'short' })}
                            </span>
                          </div>
                          {isCurrentDay && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                              Today
                            </span>
                          )}
                        </div>

                        {/* Task List for this Day */}
                        <div className="mt-3 space-y-2 flex-1">
                          {dayTasks.length === 0 && dayReminders.length === 0 ? (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic text-center py-4">
                              No tasks
                            </p>
                          ) : (
                            dayTasks.map((task) => {
                              const hasReminder = tasksWithReminders.has(task.id);
                              const isOverdue = task.status === 'OVERDUE' || (task.status !== 'COMPLETED' && new Date(task.deadline).getTime() < Date.now());
                              const isCompleted = task.status === 'COMPLETED';

                              return (
                                <div
                                  key={task.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditTask(task);
                                  }}
                                  className={`p-2 rounded-xl border flex flex-col gap-1 shadow-2xs transition-all hover:scale-[1.01] ${getCategoryStyles(
                                    task.category
                                  )} ${isCompleted ? 'opacity-50 line-through' : ''} ${
                                    isOverdue ? 'ring-1 ring-rose-500' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                                      <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(task.priority)}`} />
                                      {formatTaskTime(task.deadline)}
                                    </span>
                                    {hasReminder && (
                                      <Bell className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                                    )}
                                  </div>
                                  <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-white line-clamp-2">
                                    {task.title}
                                  </p>
                                </div>
                              );
                            })
                          )}

                          {/* Reminders for this Day */}
                          {dayReminders.map((rem) => (
                            <div
                              key={`rem-${rem.id}`}
                              className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5"
                            >
                              <Bell className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span className="truncate">{rem.reminderMessage}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDateClick(day);
                          }}
                          className="mt-3 w-full py-1.5 border border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          + Add Task
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW: DAY (Hourly Timeline) */}
            {viewMode === 'day' && (
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Chronological day agenda and hourly breakdown
                    </p>
                  </div>
                  {isToday(currentDate) && (
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                      Today
                    </span>
                  )}
                </div>

                {/* Day Tasks Timeline */}
                {(() => {
                  const dayTasks = filteredTasks
                    .filter((t) => isSameDay(new Date(t.deadline), currentDate))
                    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

                  const dayReminders = reminders.filter((r) => isSameDay(new Date(r.reminderTime), currentDate));

                  if (dayTasks.length === 0 && dayReminders.length === 0) {
                    return (
                      <div className="py-12 text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <CalendarIcon className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No tasks scheduled</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Your day is clear. Click "+ Add Task" to schedule high-priority deliverables and stay on time.
                        </p>
                        <button
                          onClick={() => handleDateClick(currentDate)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                        >
                          + Add Task For Today
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {dayTasks.map((task) => {
                        const isOverdue = task.status === 'OVERDUE' || (task.status !== 'COMPLETED' && new Date(task.deadline).getTime() < Date.now());
                        const isCompleted = task.status === 'COMPLETED';

                        return (
                          <div
                            key={task.id}
                            onClick={() => onEditTask(task)}
                            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer ${
                              isCompleted
                                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-60'
                                : isOverdue
                                ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
                                : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleComplete(task.id);
                                }}
                                className="mt-0.5 text-slate-400 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                title="Toggle complete"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                                    {task.title}
                                  </h4>
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryStyles(task.category)}`}>
                                    {task.category}
                                  </span>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              <div className="text-right">
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
                                  {formatTaskTime(task.deadline)}
                                </span>
                                <span className={`text-[10px] font-bold uppercase ${
                                  task.priority === 'HIGH' ? 'text-rose-600 dark:text-rose-400' : task.priority === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                                }`}>
                                  {task.priority} Priority
                                </span>
                              </div>

                              {isOverdue && !isCompleted && (
                                <span className="px-2 py-1 rounded-md bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

              </div>
            )}

          </div>

        </div>

        {/* 5. Right Sidebar / Calendar Insights (4 or 3 cols on desktop) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          
          {/* A. Today's Schedule Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Schedule</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {today.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {todayScheduleTasks.length} {todayScheduleTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {todayScheduleTasks.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-3">
                No tasks scheduled for today.
              </p>
            ) : (
              <div className="space-y-2.5">
                {todayScheduleTasks.map((t) => {
                  const isCompleted = t.status === 'COMPLETED';
                  return (
                    <div
                      key={t.id}
                      onClick={() => onEditTask(t)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between gap-2 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(t.id);
                          }}
                          className="text-slate-400 hover:text-emerald-600 shrink-0"
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4" />}
                        </button>
                        <span className={`text-xs font-semibold truncate ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                        {formatTaskTime(t.deadline)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* B. Upcoming Deadlines Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Deadlines</h3>
              <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold">Priority Queue</span>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-3">
                No upcoming deadlines pending.
              </p>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onEditTask(t)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {t.title}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        t.priority === 'HIGH' ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 dark:text-slate-400" />
                        {new Date(t.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {formatTaskTime(t.deadline)}
                      </span>
                      <span className="uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400">{t.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* C. Upcoming Reminders Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Reminders</h3>
              </div>
              <button
                onClick={() => onOpenAddReminder()}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + New
              </button>
            </div>

            {upcomingRemindersList.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-3">
                No reminders scheduled.
              </p>
            ) : (
              <div className="space-y-2.5">
                {upcomingRemindersList.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-950 dark:text-amber-200">
                      <span className="truncate">{r.reminderMessage}</span>
                      <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 shrink-0 ml-1">
                        {r.reminderStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-300">
                      <span>Task #{r.taskId}</span>
                      <span>{new Date(r.reminderTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {formatTaskTime(r.reminderTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
