import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Clock, Plus, ArrowRight, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TodaySessionAddModal } from '../sessions/TodaySessionAddModal';
import { LearnerTypeSelectionModal } from '../sessions/LearnerTypeSelectionModal';
import { calculateEndTime, getTodayIso } from '../../utils/dateUtils';

export const TodaysSessions = () => {
  const { user } = useAuth();
  const { myStudents, tempStudents, todaysSessions, sessionsLoading, sessionsError } = useData();
  
  // State for session creation
  const [showLearnerTypeModal, setShowLearnerTypeModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedLearnerType, setSelectedLearnerType] = useState<'general' | 'temporary' | null>(null);

  // Load data on component mount - DataContext handles this automatically
  useEffect(() => {
    // DataContext automatically fetches data when user is available
    // No need for manual fetching here
  }, [user]);

  // Session creation handlers
  const handleLearnerTypeSelection = (type: 'general' | 'temporary') => {
    setSelectedLearnerType(type);
    setShowSessionModal(true);
  };

  const handleAddSessionClick = () => {
    setShowLearnerTypeModal(true);
  };

  // Custom SessionAddModal with today's date pre-filled
  const handleSessionAdd = async (sessionData: any) => {
    try {
      const token = localStorage.getItem('access_token');
      const studentList = selectedLearnerType === 'temporary' ? tempStudents : myStudents;
      const selectedLearner = studentList.find((student: any) => student.name === sessionData.learner);
      
      if (!selectedLearner) {
        console.error('Selected learner not found');
        return;
      }

      const calculateSessionEndTime = (startTime: string, durationMinutes: number): string => {
        return calculateEndTime(startTime, durationMinutes);
      };

      // Ensure the session is for today using standardized date utility
      const today = getTodayIso();
      const backendData = {
        child_id: parseInt(selectedLearner.id.toString()),  // Ensure it's a number
        session_date: today, // Force today's date
        start_time: sessionData.time,
        end_time: calculateSessionEndTime(sessionData.time, 60),
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
        setShowSessionModal(false);
        setSelectedLearnerType(null);
        try {
          const sessionData = await response.json();
          window.dispatchEvent(new CustomEvent('scheduleChanged', { detail: { session: sessionData } }));
        } catch (e) {
          console.log('Today\'s session created successfully');
          window.dispatchEvent(new CustomEvent('scheduleChanged'));
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to create session:', errorData.detail || 'Unknown error');
      }
    } catch (err) {
      console.error('Session creation error:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.6 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Today's Sessions</CardTitle>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddSessionClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:from-violet-700 hover:to-blue-700 transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              Add Session
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : sessionsError ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-red-600 dark:text-red-400 mb-4">{sessionsError}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // DataContext will handle refreshing
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </motion.button>
            </div>
          ) : todaysSessions.length > 0 ? (
            <div className="space-y-3">
              {todaysSessions.map((session: any, index: number) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                  className="relative p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-sm transition-all cursor-pointer"
                >
                  {/* Status indicator bar */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                      session.status === 'completed' ? 'bg-green-500' :
                      session.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-orange-500'
                    }`}
                  />
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pl-2">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {session.student_name || 'Unknown Student'}
                        </h4>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {session.start_time} - {session.end_time}
                        </span>
                      </div>
                      
                      {session.therapist_notes && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                          {session.therapist_notes}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            session.status === 'completed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : session.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                          {session.status.replace('_', ' ').charAt(0).toUpperCase() + session.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">No sessions scheduled for today</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddSessionClick}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium hover:shadow-lg hover:from-violet-700 hover:to-blue-700 transition-all duration-300"
              >
                Schedule Your First Session
              </motion.button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Learner Type Selection Modal */}
      {showLearnerTypeModal && (
        <LearnerTypeSelectionModal
          open={showLearnerTypeModal}
          onClose={() => setShowLearnerTypeModal(false)}
          onSelectType={handleLearnerTypeSelection}
        />
      )}

      {/* Session Add Modal - Restricted to Today's Date */}
      {showSessionModal && (
        <TodaySessionAddModal
          open={showSessionModal}
          onClose={() => {
            setShowSessionModal(false);
            setSelectedLearnerType(null);
          }}
          onAdd={handleSessionAdd}
          students={selectedLearnerType === 'temporary' ? tempStudents : myStudents}
          todaysSessions={todaysSessions}
        />
      )}
    </motion.div>
  );
};
