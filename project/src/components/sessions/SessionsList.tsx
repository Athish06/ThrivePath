import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CalendarClock,
  CalendarPlus,
  Clock,
  User,
  Plus,
  BookOpen,
  Settings,
  Activity,
  RefreshCw,
  CheckCircle,
  Ban,
  Copy,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SessionActivitiesModal } from './SessionActivitiesModal';
import { SessionAddModal } from './SessionAddModal';
import { LearnerTypeSelectionModal } from './LearnerTypeSelectionModal';
import { Dropdown, DropdownItem, DropdownSeparator } from '../ui/dropdown';
import { SessionRescheduleModal } from './SessionRescheduleModal';

interface Session {
  id: number;
  therapist_id: number;
  child_id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_planned_activities: number;
  completed_activities: number;
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  prerequisite_completion_required: boolean;
  therapist_notes?: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  therapist_name?: string;
}

export const SessionsList: React.FC = () => {
  const { user } = useAuth();
  const { myStudents, tempStudents, backendSessions, sessionsLoading, refreshSessionsPage } = useData();
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showLearnerTypeModal, setShowLearnerTypeModal] = useState(false);
  const [selectedLearnerType, setSelectedLearnerType] = useState<'general' | 'temporary' | null>(null);
  const [activeOptionsSessionId, setActiveOptionsSessionId] = useState<number | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Session | null>(null);
  const [isUpdatingSessionId, setIsUpdatingSessionId] = useState<number | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);


  // Load data on component mount - DataContext handles this automatically
  useEffect(() => {
    // DataContext automatically fetches data when user is available
    // No need for manual fetching here
  }, [user]);

  const handleLearnerTypeSelection = (type: 'general' | 'temporary') => {
    setSelectedLearnerType(type);
    setShowCreateModal(true);
  };

  const handleAddSessionClick = () => {
    setShowLearnerTypeModal(true);
  };

  const handleSessionAdd = async (sessionData: any) => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Find the selected learner from the appropriate student list
      const studentList = selectedLearnerType === 'temporary' ? tempStudents : myStudents;
      const selectedLearner = studentList.find((student: any) =>
        student.name === sessionData.learner
      );
      
      if (!selectedLearner) {
        setError('Selected learner not found');
        return;
      }

      // Convert the sessionData format to backend format
      const backendData = {
        child_id: parseInt(selectedLearner.id.toString()),  // Ensure it's a number
        session_date: sessionData.date,
        start_time: sessionData.time,
        end_time: calculateEndTime(sessionData.time, 60), // Default 60 min session
        therapist_notes: sessionData.notes || '',
        session_activities: sessionData.childGoals?.map((childGoalId: number) => ({
          child_goal_id: childGoalId,
          actual_duration: 30, // Default duration, can be updated later
          performance_notes: ''
        })) || []
      };

      const response = await fetch('http://localhost:8000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backendData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        try {
          const createdSession = await response.json();
          window.dispatchEvent(new CustomEvent('scheduleChanged', { detail: { session: createdSession } }));
        } catch (e) {
          window.dispatchEvent(new CustomEvent('scheduleChanged'));
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create session');
      }
    } catch (err) {
      setError('Error creating session');
      console.error('Session creation error:', err);
    }
  };

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const normalizeTimeValue = (timeString: string) => {
    if (!timeString) return '00:00';
    return timeString.length >= 5 ? timeString.slice(0, 5) : timeString;
  };

  const getSessionDurationMinutes = (session: Session) => {
    const start = normalizeTimeValue(session.start_time);
    const end = normalizeTimeValue(session.end_time);

    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    const startDate = new Date();
    const endDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);
    endDate.setHours(endHour, endMinute, 0, 0);

    const diff = (endDate.getTime() - startDate.getTime()) / 60000;
    return diff > 0 ? diff : 60;
  };

  const handleRescheduleSubmit = async ({ date, time }: { date: string; time: string }) => {
    if (!rescheduleTarget) {
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setActionFeedback({ type: 'error', message: 'Missing access token. Please log in again.' });
      return;
    }

    setIsUpdatingSessionId(rescheduleTarget.id);

    try {
      const durationMinutes = getSessionDurationMinutes(rescheduleTarget);
      const endTime = calculateEndTime(time, durationMinutes);

      const response = await fetch(`http://localhost:8000/api/sessions/${rescheduleTarget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          session_date: date,
          start_time: time,
          end_time: endTime
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to reschedule session');
      }

      setActionFeedback({
        type: 'success',
        message: `Session with ${rescheduleTarget.student_name || 'learner'} rescheduled successfully.`
      });

      setRescheduleTarget(null);
      window.dispatchEvent(new CustomEvent('scheduleChanged'));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reschedule session';
      setActionFeedback({ type: 'error', message });
    } finally {
      setIsUpdatingSessionId(null);
      await refreshSessionsPage();
    }
  };

  const handleMarkCompleted = async (session: Session) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setActionFeedback({ type: 'error', message: 'Missing access token. Please log in again.' });
      return;
    }

    setIsUpdatingSessionId(session.id);

    try {
      const response = await fetch(`http://localhost:8000/api/sessions/${session.id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to mark session as completed');
      }

      setActionFeedback({
        type: 'success',
        message: `Marked session with ${session.student_name || 'learner'} as completed.`
      });

      window.dispatchEvent(new CustomEvent('scheduleChanged'));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark session as completed';
      setActionFeedback({ type: 'error', message });
    } finally {
      setIsUpdatingSessionId(null);
      await refreshSessionsPage();
    }
  };

  const handleCancelSession = async (session: Session) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setActionFeedback({ type: 'error', message: 'Missing access token. Please log in again.' });
      return;
    }

    setIsUpdatingSessionId(session.id);

    try {
      const response = await fetch(`http://localhost:8000/api/sessions/${session.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: session.id,
          new_status: 'cancelled'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to cancel session');
      }

      setActionFeedback({
        type: 'success',
        message: `Cancelled session with ${session.student_name || 'learner'}.`
      });

      window.dispatchEvent(new CustomEvent('scheduleChanged'));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel session';
      setActionFeedback({ type: 'error', message });
    } finally {
      setIsUpdatingSessionId(null);
      await refreshSessionsPage();
    }
  };

  const buildSessionSummary = (session: Session) => {
    const learnerName = session.student_name || 'Learner';
    const date = formatDate(session.session_date);
    const timeRange = `${formatTime(session.start_time)} - ${formatTime(session.end_time)}`;
    const status = session.status.replace('_', ' ').toUpperCase();
    const activitiesSummary = `${session.completed_activities}/${session.total_planned_activities} activities completed`;

    return `Session Summary\nLearner: ${learnerName}\nStatus: ${status}\nWhen: ${date} at ${timeRange}\nProgress: ${activitiesSummary}`;
  };

  const handleCopySessionSummary = async (session: Session) => {
    const summary = buildSessionSummary(session);

    try {
      await navigator.clipboard.writeText(summary);
      setActionFeedback({
        type: 'success',
        message: `Copied session summary for ${session.student_name || 'learner'}.`
      });
    } catch (error) {
      console.error('Clipboard copy failed', error);
      setActionFeedback({
        type: 'error',
        message: 'Unable to copy summary. Please try again.'
      });
    }
  };

  const formatDateTimeForICS = (date: string, time: string) => {
    const normalizedTime = normalizeTimeValue(time);
    const [hours, minutes] = normalizedTime.split(':').map(Number);
    const eventDate = new Date(date);
    eventDate.setHours(hours, minutes, 0, 0);
    const parts = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0];
    return `${parts}Z`;
  };

  const handleDownloadCalendarInvite = (session: Session) => {
    try {
      const dtStart = formatDateTimeForICS(session.session_date, session.start_time);
      const dtEnd = formatDateTimeForICS(session.session_date, session.end_time);
      const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const uid = `session-${session.id}@thrivepath`;
      const learnerName = session.student_name || 'Learner';
      const summary = `Therapy Session • ${learnerName}`;
      const description = buildSessionSummary(session).replace(/\n/g, '\\n');

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ThrivePath//Session Planner//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `session-${session.id}.ics`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setActionFeedback({
        type: 'success',
        message: 'Downloaded calendar invite for the session.'
      });
    } catch (error) {
      console.error('ICS download failed', error);
      setActionFeedback({
        type: 'error',
        message: 'Unable to download calendar invite. Please try again.'
      });
    }
  };

  useEffect(() => {
    // DataContext automatically loads data when user is available
    // No need for manual data loading here
  }, [user]);

  useEffect(() => {
    if (!actionFeedback) return;

    const timeoutId = window.setTimeout(() => setActionFeedback(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [actionFeedback]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'no_show':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-8">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-black">
      {/* Floating orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-10 h-32 w-32 rounded-full bg-gradient-to-br from-violet-400/20 to-blue-400/20 blur-2xl"
        />
        <motion.div
          animate={{ 
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 left-20 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 blur-2xl"
        />
        <motion.div
          animate={{ 
            x: [0, 20, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/3 h-20 w-20 rounded-full bg-gradient-to-br from-pink-400/20 to-rose-400/20 blur-2xl"
        />
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex justify-between items-start"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
              Therapy Sessions
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and track your therapy sessions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshSessionsPage}
              disabled={sessionsLoading}
              className="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${sessionsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddSessionClick}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Session
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {actionFeedback && (
            <motion.div
              key="session-action-feedback"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
                actionFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700/40 dark:text-emerald-200'
                  : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-700/40 dark:text-rose-200'
              }`}
            >
              {actionFeedback.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              <span>{actionFeedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sessions Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          {/* Sessions Grid */}
          {backendSessions.length === 0 ? (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 mb-6"
              >
                <Calendar className="h-10 w-10 text-violet-600 dark:text-violet-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                No sessions yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Create your first therapy session to get started with managing your learners' progress
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddSessionClick}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl hover:from-violet-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Create Session
              </motion.button>
            </div>
          ) : (
            <div className="grid gap-6">
          {backendSessions.map((session: Session, index: number) => {
            const isCompleted = session.status === 'completed';
            const isCancelled = session.status === 'cancelled';
            const canModifySchedule = !isCompleted && !isCancelled;
            const canCancel = !isCancelled && !isCompleted;
            const isProcessingThisSession = isUpdatingSessionId === session.id;
            const isOptionsOpen = activeOptionsSessionId === session.id;

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="relative overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/15 via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl p-6 md:p-8 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl group-hover:opacity-80 opacity-0 transition-opacity duration-500" />

                    <div className="relative z-10 space-y-6">
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg">
                              <User className="h-7 w-7 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1">
                              <div className={`w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                                session.status === 'completed' ? 'bg-green-500' :
                                session.status === 'in_progress' ? 'bg-yellow-500' :
                                session.status === 'scheduled' ? 'bg-blue-500' :
                                'bg-slate-400'
                              }`} />
                            </div>
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                                {session.student_name || 'Unknown Student'}
                              </h3>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm ${getStatusColor(session.status)}`}>
                                {session.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            {session.therapist_name && (
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Guided by {session.therapist_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 px-3 py-1.5">
                            <Calendar className="h-4 w-4 text-violet-600" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {formatDate(session.session_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/60 px-3 py-1.5">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-200">
                              {formatTime(session.start_time)} – {formatTime(session.end_time)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-900/60 px-4 py-3">
                          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Estimated Duration</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {getSessionDurationMinutes(session)} minutes
                          </p>
                          <p className="mt-1 text-xs text-slate-500/70 dark:text-slate-400/70">Automatically calculated</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-900/60 px-4 py-3">
                          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Activities</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {session.total_planned_activities} planned
                          </p>
                          <p className="mt-1 text-xs text-slate-500/70 dark:text-slate-400/70">{session.completed_activities} completed so far</p>
                        </div>
                      </div>

                      {session.therapist_notes && (
                        <div className="rounded-2xl border border-violet-200/60 dark:border-violet-800/60 bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-300">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-violet-600/80 dark:text-violet-200/70 mb-1 font-medium">Therapist Notes</p>
                              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                                {session.therapist_notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-900/50 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-4">
                          {session.total_planned_activities > 0 ? (
                            <div className="flex items-center gap-3">
                              <div className="relative h-14 w-14">
                                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                                  <path
                                    className="text-slate-200 dark:text-slate-700"
                                    strokeWidth="3"
                                    d="M18 2.0845
                                       a 15.9155 15.9155 0 0 1 0 31.831
                                       a 15.9155 15.9155 0 0 1 0 -31.831"
                                    stroke="currentColor"
                                    fill="none"
                                  />
                                  <path
                                    className="text-violet-500"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    d="M18 2.0845
                                       a 15.9155 15.9155 0 0 1 0 31.831"
                                    strokeDasharray={`${Math.min(100, Math.round((session.completed_activities / session.total_planned_activities) * 100))}, 100`}
                                    stroke="currentColor"
                                    fill="none"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    {Math.round((session.completed_activities / session.total_planned_activities) * 100)}%
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Progress</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                  {session.completed_activities}/{session.total_planned_activities} Activities
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              No activities assigned yet.
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedSession(session)}
                            className="flex items-center gap-2 rounded-xl border border-violet-200/70 dark:border-violet-800/60 bg-gradient-to-r from-violet-600/90 to-blue-600/90 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <BookOpen className="h-4 w-4" />
                            Activities
                          </motion.button>
                          <Dropdown
                            align="right"
                            side="top"
                            isOpen={isOptionsOpen}
                            onToggle={(open) => {
                              if (isUpdatingSessionId !== null && open) {
                                return;
                              }
                              setActiveOptionsSessionId(open ? session.id : null);
                            }}
                            className="w-64 max-h-72 overflow-y-auto shadow-2xl ring-1 ring-black/10"
                            trigger={
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                disabled={isUpdatingSessionId !== null && isUpdatingSessionId !== session.id}
                                className="flex items-center gap-2 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isProcessingThisSession ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Settings className="h-4 w-4" />
                                )}
                                {isProcessingThisSession ? 'Processing...' : 'Options'}
                              </motion.button>
                            }
                          >
                            {canModifySchedule && (
                              <DropdownItem
                                icon={<CalendarClock className="h-4 w-4 text-violet-600 dark:text-violet-200" />}
                                onClick={() => {
                                  setActiveOptionsSessionId(null);
                                  setRescheduleTarget(session);
                                }}
                              >
                                Reschedule Session
                              </DropdownItem>
                            )}
                            {canModifySchedule && (
                              <DropdownItem
                                icon={<CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />}
                                onClick={() => {
                                  setActiveOptionsSessionId(null);
                                  void handleMarkCompleted(session);
                                }}
                              >
                                Mark as Completed
                              </DropdownItem>
                            )}
                            {(canModifySchedule || canCancel) && (
                              <DropdownSeparator />
                            )}
                            <DropdownItem
                              icon={<Copy className="h-4 w-4 text-slate-500 dark:text-slate-300" />}
                              onClick={() => {
                                setActiveOptionsSessionId(null);
                                void handleCopySessionSummary(session);
                              }}
                            >
                              Copy Session Summary
                            </DropdownItem>
                            <DropdownItem
                              icon={<CalendarPlus className="h-4 w-4 text-blue-500 dark:text-blue-300" />}
                              onClick={() => {
                                setActiveOptionsSessionId(null);
                                handleDownloadCalendarInvite(session);
                              }}
                            >
                              Download Calendar Invite
                            </DropdownItem>
                            {canCancel && (
                              <>
                                <DropdownSeparator />
                                <DropdownItem
                                  variant="danger"
                                  icon={<Ban className="h-4 w-4" />}
                                  onClick={() => {
                                    setActiveOptionsSessionId(null);
                                    void handleCancelSession(session);
                                  }}
                                >
                                  Cancel Session
                                </DropdownItem>
                              </>
                            )}
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
        </motion.div>

      {/* Create Session Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <SessionAddModal
            open={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedLearnerType(null);
            }}
            onAdd={handleSessionAdd}
            students={selectedLearnerType === 'temporary' ? tempStudents : myStudents}
            allSessions={backendSessions}
          />
        )}
      </AnimatePresence>

      {/* Learner Type Selection Modal */}
      <AnimatePresence>
        {showLearnerTypeModal && (
          <LearnerTypeSelectionModal
            open={showLearnerTypeModal}
            onClose={() => setShowLearnerTypeModal(false)}
            onSelectType={handleLearnerTypeSelection}
          />
        )}
      </AnimatePresence>

      {/* Session Activities Modal */}
      <AnimatePresence>
        {selectedSession && (
          <SessionActivitiesModal
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            onUpdate={() => window.dispatchEvent(new CustomEvent('scheduleChanged'))}
          />
        )}
      </AnimatePresence>

      <SessionRescheduleModal
        open={Boolean(rescheduleTarget)}
        session={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onConfirm={handleRescheduleSubmit}
        isSubmitting={Boolean(rescheduleTarget && isUpdatingSessionId === rescheduleTarget.id)}
      />
      </div>
    </div>
  );
};
