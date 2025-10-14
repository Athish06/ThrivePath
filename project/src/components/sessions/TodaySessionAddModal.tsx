import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Calendar as CalendarIcon, BookOpen, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import Stepper, { Step } from '../ui/Stepper';
import AnalogClock from '../ui/AnalogClock';
import { getTodayIso } from '../../utils/dateUtils';
import { checkTimeConflicts, TimeConflict } from '../../utils/sessionScheduling';
import { useTherapistSettings } from '../../hooks/useTherapistSettings';

export interface TodaySessionAddModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (session: any) => void;
  students: Student[];
  todaysSessions?: BackendSession[];
}

interface Student {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
}

interface Activity {
  id: number;
  activity_name: string;
  activity_description?: string;
}

interface BackendSession {
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

interface SessionData {
  learnerId: string;
  date: string;
  time: string;
  activities: string[];
  notes: string;
}

export const TodaySessionAddModal: React.FC<TodaySessionAddModalProps> = ({ open, onClose, onAdd, students, todaysSessions = [] }) => {
  const { workingHours, freeHours } = useTherapistSettings();
  // Get today's date in YYYY-MM-DD format
  const today = getTodayIso();
  
  const [sessionData, setSessionData] = useState<SessionData>({
    learnerId: '',
    date: today, // Pre-filled with today's date
    time: '',
    activities: [],
    notes: ''
  });
  
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [timeConflict, setTimeConflict] = useState<TimeConflict>({ type: 'none', message: '', severity: 'none' });
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  // Fetch activities when a student is selected
  useEffect(() => {
    const fetchActivities = async () => {
      if (!sessionData.learnerId) {
        setAvailableActivities([]);
        return;
      }

      setLoadingActivities(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:8000/api/students/${sessionData.learnerId}/activities`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAvailableActivities(data);
        } else {
          console.error('Failed to fetch activities:', response.status);
          // Fallback to mock activities if API fails
          setAvailableActivities([
            { id: 1, activity_name: 'Speech Therapy', activity_description: 'Improve speech and communication skills' },
            { id: 2, activity_name: 'Occupational Therapy', activity_description: 'Develop daily living skills' },
            { id: 3, activity_name: 'Behavioral Session', activity_description: 'Address behavioral challenges' },
            { id: 4, activity_name: 'Social Skills', activity_description: 'Enhance social interaction abilities' },
            { id: 5, activity_name: 'Sensory Play', activity_description: 'Sensory integration activities' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        // Fallback to mock activities
        setAvailableActivities([
          { id: 1, activity_name: 'Speech Therapy', activity_description: 'Improve speech and communication skills' },
          { id: 2, activity_name: 'Occupational Therapy', activity_description: 'Develop daily living skills' },
          { id: 3, activity_name: 'Behavioral Session', activity_description: 'Address behavioral challenges' },
          { id: 4, activity_name: 'Social Skills', activity_description: 'Enhance social interaction abilities' },
          { id: 5, activity_name: 'Sensory Play', activity_description: 'Sensory integration activities' },
        ]);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [sessionData.learnerId]);

  const handleInputChange = (field: keyof SessionData, value: string | string[]) => {
    // Prevent changing the date - always keep it as today
    if (field === 'date') return;
    
    setSessionData(prev => ({
      ...prev,
      [field]: value
    }));

    // Check for time conflicts when time changes
    if (field === 'time') {
      const newData = { ...sessionData, [field]: value };
      if (newData.time) {
        const conflict = checkTimeConflicts(today, newData.time as string, workingHours, freeHours, todaysSessions);
        setTimeConflict(conflict);
      }
    }
  };

  const toggleActivity = (activity: string) => {
    setSessionData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const handleConflictConfirm = () => {
    // User confirmed they want to proceed despite the conflict
    setShowConflictDialog(false);
    const selectedLearner = students.find(s => s.id.toString() === sessionData.learnerId);
    if (selectedLearner && sessionData.time && sessionData.activities.length > 0) {
      onAdd({
        learner: selectedLearner.name,
        date: today, // Always use today's date
        time: sessionData.time,
        activities: sessionData.activities,
        notes: sessionData.notes,
      });
      
      // Reset form
      setSessionData({
        learnerId: '',
        date: today,
        time: '',
        activities: [],
        notes: ''
      });
      setAvailableActivities([]);
      setTimeConflict({ type: 'none', message: '', severity: 'none' });
      onClose();
    }
  };

  const handleSubmit = () => {
    // Check for time conflicts before submitting
    if (sessionData.time) {
      const conflict = checkTimeConflicts(today, sessionData.time, workingHours, freeHours, todaysSessions);
      if (conflict.type !== 'none') {
        setTimeConflict(conflict);
        if (conflict.severity === 'error') {
          // For errors (session conflicts), don't show dialog - just prevent submission
          return;
        } else {
          // For warnings (working hours/free time), show confirmation dialog
          setShowConflictDialog(true);
          return; // Don't proceed with submission
        }
      }
    }

    const selectedLearner = students.find(s => s.id.toString() === sessionData.learnerId);
    if (selectedLearner && sessionData.time && sessionData.activities.length > 0) {
      onAdd({
        learner: selectedLearner.name,
        date: today, // Always use today's date
        time: sessionData.time,
        activities: sessionData.activities,
        notes: sessionData.notes,
      });
      
      // Reset form
      setSessionData({
        learnerId: '',
        date: today,
        time: '',
        activities: [],
        notes: ''
      });
      setAvailableActivities([]);
      setTimeConflict({ type: 'none', message: '', severity: 'none' });
      onClose();
    }
  };

  if (!open) return null;

  const selectedStudent = students.find(s => s.id.toString() === sessionData.learnerId);

  // Student Selector Popup Component
  const StudentSelectorPopup = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={() => setShowStudentSelector(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                  Select Student
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Choose who this session is for
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowStudentSelector(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="space-y-3">
            {students.map(student => (
              <button
                key={student.id}
                onClick={() => {
                  handleInputChange('learnerId', student.id.toString());
                  setShowStudentSelector(false);
                }}
                className={`w-full p-4 rounded-xl transition-all border-2 text-left ${
                  sessionData.learnerId === student.id.toString()
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    sessionData.learnerId === student.id.toString()
                      ? 'bg-violet-600 text-white'
                      : 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-slate-700 dark:to-slate-600 text-blue-700 dark:text-blue-300'
                  }`}>
                    {student.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <span className="font-medium text-slate-800 dark:text-white">{student.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-8 pb-0">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Schedule Today's Session
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Create a new therapy session for today ({new Date().toLocaleDateString()})
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <Stepper
              initialStep={1}
              onFinalStepCompleted={handleSubmit}
              backButtonText="Previous"
              nextButtonText="Next"
              disabled={timeConflict.severity === 'error'}
            >
              {/* Step 1: Select Learner */}
              <Step>
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                      Select Student
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Choose who this session is for
                    </p>
                  </div>

                  {selectedStudent ? (
                    <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center text-lg font-semibold">
                            {selectedStudent.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white">
                              {selectedStudent.name}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Selected Student
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowStudentSelector(true)}
                          className="px-4 py-2 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-lg transition-colors font-medium"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <button
                        onClick={() => setShowStudentSelector(true)}
                        className="w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-violet-400 dark:hover:border-violet-500 transition-colors group"
                      >
                        <Users className="h-12 w-12 text-slate-400 group-hover:text-violet-500 mx-auto mb-3" />
                        <p className="text-slate-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 font-medium">
                          Click to select a student
                        </p>
                      </button>
                    </div>
                  )}
                </div>
              </Step>

              {/* Step 2: Set Time (Date is fixed to today) */}
              <Step>
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                      Schedule for Today
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Pick the time for today's session
                    </p>
                  </div>

                  {/* Fixed Date Display */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
                    <div className="flex items-center justify-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-blue-800 dark:text-blue-200">
                        Session Date: {new Date().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <p className="text-center text-sm text-blue-600 dark:text-blue-400 mt-2">
                      Today's sessions are automatically scheduled for today's date
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 text-center">
                      Session Time
                    </label>
                    <div className="flex justify-center">
                      <AnalogClock
                        value={sessionData.time}
                        onChange={(time) => handleInputChange('time', time)}
                        size={260}
                        className="max-w-fit"
                      />
                    </div>
                  </div>

                  {/* Time Conflict Warning */}
                  {timeConflict.type !== 'none' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border ${
                        timeConflict.severity === 'error'
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          : timeConflict.severity === 'warning'
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {timeConflict.severity === 'error' ? (
                          <X className={`h-5 w-5 mt-0.5 ${
                            timeConflict.severity === 'error'
                              ? 'text-red-600 dark:text-red-400'
                              : timeConflict.severity === 'warning'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        ) : timeConflict.severity === 'warning' ? (
                          <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                            timeConflict.severity === 'warning'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        ) : (
                          <Info className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            timeConflict.severity === 'error'
                              ? 'text-red-800 dark:text-red-200'
                              : timeConflict.severity === 'warning'
                              ? 'text-amber-800 dark:text-amber-200'
                              : 'text-blue-800 dark:text-blue-200'
                          }`}>
                            {timeConflict.type === 'session-conflict'
                              ? 'Session Time Conflict'
                              : timeConflict.type === 'non-working-hours'
                              ? 'Outside Working Hours'
                              : 'Free Time Conflict'}
                          </p>
                          <p className={`text-sm mt-1 ${
                            timeConflict.severity === 'error'
                              ? 'text-red-700 dark:text-red-300'
                              : timeConflict.severity === 'warning'
                              ? 'text-amber-700 dark:text-amber-300'
                              : 'text-blue-700 dark:text-blue-300'
                          }`}>
                            {timeConflict.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </Step>

              {/* Step 3: Choose Activities */}
              <Step>
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                      Choose Activities
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Select the therapy activities for this session
                    </p>
                  </div>

                  {loadingActivities ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-3 text-slate-600 dark:text-slate-400">Loading activities...</span>
                    </div>
                  ) : availableActivities.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {availableActivities.map(activity => (
                        <button
                          key={activity.id}
                          onClick={() => toggleActivity(activity.activity_name)}
                          className={`p-4 rounded-xl transition-all border-2 text-left ${
                            sessionData.activities.includes(activity.activity_name)
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 bg-white dark:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                sessionData.activities.includes(activity.activity_name)
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-slate-700 dark:to-slate-600 text-green-700 dark:text-green-300'
                              }`}>
                                <BookOpen className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="font-medium text-slate-800 dark:text-white block">{activity.activity_name}</span>
                                {activity.activity_description && (
                                  <span className="text-sm text-slate-500 dark:text-slate-400">{activity.activity_description}</span>
                                )}
                              </div>
                            </div>
                            {sessionData.activities.includes(activity.activity_name) && (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : sessionData.learnerId ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">No activities found for this student.</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">Please select a student first to see available activities.</p>
                    </div>
                  )}

                  {sessionData.activities.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                        {sessionData.activities.length} activit{sessionData.activities.length === 1 ? 'y' : 'ies'} selected
                      </p>
                    </div>
                  )}
                </div>
              </Step>

              {/* Step 4: Add Notes */}
              <Step>
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                      Session Notes
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Add any additional notes or instructions for this session
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Therapist Notes (Optional)
                    </label>
                    <textarea
                      value={sessionData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-slate-800 dark:text-white resize-none"
                      placeholder="Add any notes about this session, special instructions, goals, or observations..."
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      These notes will be saved with the session and can help guide the therapy activities.
                    </p>
                  </div>

                  {/* Session Summary */}
                  <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl">
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-4">Session Summary</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Student:</span>
                        <span className="font-medium text-slate-800 dark:text-white">
                          {selectedStudent?.name || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Date:</span>
                        <span className="font-medium text-slate-800 dark:text-white">
                          Today ({new Date().toLocaleDateString()})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Time:</span>
                        <span className="font-medium text-slate-800 dark:text-white">
                          {sessionData.time || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Activities:</span>
                        <span className="font-medium text-slate-800 dark:text-white">
                          {sessionData.activities.length} selected
                        </span>
                      </div>
                      {sessionData.notes && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                          <span className="text-slate-600 dark:text-slate-400 block mb-1">Notes:</span>
                          <span className="text-slate-800 dark:text-white text-xs">
                            {sessionData.notes.substring(0, 100)}
                            {sessionData.notes.length > 100 ? '...' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Step>
            </Stepper>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Conflict Confirmation Dialog */}
      <AnimatePresence>
        {showConflictDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1001] p-4"
            onClick={() => setShowConflictDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    timeConflict.severity === 'warning'
                      ? 'bg-amber-100 dark:bg-amber-900/50'
                      : 'bg-blue-100 dark:bg-blue-900/50'
                  }`}>
                    {timeConflict.severity === 'warning' ? (
                      <AlertTriangle className={`h-6 w-6 ${
                        timeConflict.severity === 'warning'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`} />
                    ) : (
                      <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                      {timeConflict.type === 'non-working-hours' ? 'Outside Working Hours' : 'Free Time Conflict'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Please confirm your scheduling choice
                    </p>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 mb-6">
                  {timeConflict.message}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConflictDialog(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors font-medium"
                  >
                    Edit Time
                  </button>
                  <button
                    onClick={handleConflictConfirm}
                    className={`flex-1 px-4 py-3 text-white rounded-xl transition-colors font-medium ${
                      timeConflict.severity === 'warning'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Continue Anyway
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Student Selector Popup */}
      <AnimatePresence>
        {showStudentSelector && <StudentSelectorPopup />}
      </AnimatePresence>
    </AnimatePresence>
  );
};