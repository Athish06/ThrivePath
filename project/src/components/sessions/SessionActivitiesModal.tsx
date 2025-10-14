import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Clock, Target, XCircle } from 'lucide-react';

interface SessionActivity {
  id: number;
  session_id: number;
  child_goal_id: number;
  actual_duration: number;
  performance_notes?: string;
  created_at: string;
  updated_at: string;
  child_goal?: {
    id: number;
    child_id: number;
    activity_id: number;
    target_frequency: number;
    assigned_date: string;
    activity?: {
      id: number;
      activity_name: string;
      description?: string;
      domain?: string;
      difficulty_level?: number;
      estimated_duration?: number;
    };
  };
}

interface ChildGoal {
  id: number;
  child_id: number;
  activity_id: number;
  target_frequency: number;
  assigned_date: string;
  activity?: {
    id: number;
    activity_name: string;
    description?: string;
    domain?: string;
    difficulty_level?: number;
    estimated_duration?: number;
  };
}

interface Session {
  id: number;
  child_id: number;
  student_name?: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_planned_activities: number;
  completed_activities: number;
}

interface SessionActivitiesModalProps {
  session: Session;
  onClose: () => void;
  onUpdate?: () => void;
}

export const SessionActivitiesModal: React.FC<SessionActivitiesModalProps> = ({ 
  session, 
  onClose, 
  onUpdate 
}) => {
  const [sessionActivities, setSessionActivities] = useState<SessionActivity[]>([]);
  const [availableChildGoals, setAvailableChildGoals] = useState<ChildGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionActivities = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/sessions/${session.id}/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessionActivities(data);
      } else {
        setError('Failed to fetch session activities');
      }
    } catch (err) {
      setError('Error fetching session activities');
      console.error('Session activities fetch error:', err);
    }
  };

  const fetchAvailableChildGoals = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/students/${session.child_id}/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableChildGoals(data);
      }
    } catch (err) {
      console.error('Available child goals fetch error:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSessionActivities(), fetchAvailableChildGoals()]);
      setLoading(false);
    };

    loadData();
  }, [session.id, session.child_id]);

  const addActivityToSession = async (childGoalId: number, actualDuration?: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/sessions/${session.id}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          child_goal_id: childGoalId,
          actual_duration: actualDuration || 30,
          performance_notes: ''
        })
      });

      if (response.ok) {
        await fetchSessionActivities();
        if (onUpdate) onUpdate();
        setShowAddModal(false);
      } else {
        setError('Failed to add activity to session');
      }
    } catch (err) {
      setError('Error adding activity to session');
    }
  };

  const removeActivityFromSession = async (activityId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/sessions/${session.id}/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchSessionActivities();
        if (onUpdate) onUpdate();
      } else {
        setError('Failed to remove activity from session');
      }
    } catch (err) {
      setError('Error removing activity from session');
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 2:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 3:
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      case 4:
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 5:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300';
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
          <span className="text-slate-700 dark:text-slate-300">Loading activities...</span>
        </div>
      </motion.div>
    );
  }

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              Session Activities - {session.student_name}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {new Date(session.session_date).toLocaleDateString()} • {session.start_time} - {session.end_time}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg hover:from-violet-700 hover:to-blue-700 transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              Add Activity
            </motion.button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {sessionActivities.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                No activities planned yet
              </h3>
              <p className="text-slate-500 dark:text-slate-500 mb-6">
                Add activities to this session to help track progress
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl hover:from-violet-700 hover:to-blue-700 transition-all duration-300"
              >
                Add First Activity
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {activity.child_goal?.activity?.activity_name || 'Unknown Activity'}
                        </h3>
                        {activity.child_goal?.activity?.difficulty_level && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.child_goal.activity.difficulty_level)}`}>
                            Level {activity.child_goal.activity.difficulty_level}
                          </span>
                        )}
                      </div>
                      {activity.child_goal?.activity?.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {activity.child_goal.activity.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Actual Duration: {activity.actual_duration}min
                        </div>
                        {activity.child_goal?.target_frequency && (
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            Target: {activity.child_goal.target_frequency}x/week
                          </div>
                        )}
                      </div>
                      {activity.performance_notes && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Performance Notes:</strong> {activity.performance_notes}
                          </p>
                        </div>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeActivityFromSession(activity.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Activity Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddActivityModal
            availableChildGoals={availableChildGoals}
            sessionActivities={sessionActivities}
            onClose={() => setShowAddModal(false)}
            onAdd={addActivityToSession}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};

// Add Activity Modal Component
interface AddActivityModalProps {
  availableChildGoals: ChildGoal[];
  sessionActivities: SessionActivity[];
  onClose: () => void;
  onAdd: (childGoalId: number, actualDuration?: number) => void;
}

const AddActivityModal: React.FC<AddActivityModalProps> = ({ 
  availableChildGoals, 
  sessionActivities, 
  onClose, 
  onAdd 
}) => {
  const [selectedChildGoal, setSelectedChildGoal] = useState<ChildGoal | null>(null);
  const [actualDuration, setActualDuration] = useState<string>('30');

  // Filter out child goals already in session
  const alreadyInSession = sessionActivities.map(sa => sa.child_goal_id);
  const filteredChildGoals = availableChildGoals.filter(
    childGoal => !alreadyInSession.includes(childGoal.id)
  );

  const handleAdd = () => {
    if (selectedChildGoal) {
      const duration = actualDuration ? parseInt(actualDuration) : 30;
      onAdd(selectedChildGoal.id, duration);
    }
  };

  const addModalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Add Activity to Session
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {filteredChildGoals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              All assigned activities are already in this session
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Select Activity:
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredChildGoals.map((childGoal) => (
                  <div
                    key={childGoal.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedChildGoal?.id === childGoal.id
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => {
                      setSelectedChildGoal(childGoal);
                      setActualDuration(childGoal.activity?.estimated_duration?.toString() || '30');
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800 dark:text-white">
                          {childGoal.activity?.activity_name || 'Unknown Activity'}
                        </h4>
                        {childGoal.activity?.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {childGoal.activity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {childGoal.activity?.difficulty_level && (
                            <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(childGoal.activity.difficulty_level)}`}>
                              Level {childGoal.activity.difficulty_level}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Target: {childGoal.target_frequency}x/week
                          </span>
                          {childGoal.activity?.estimated_duration && (
                            <span className="text-xs text-slate-500">
                              Est: {childGoal.activity.estimated_duration} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedChildGoal && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Actual Duration (minutes):
                </label>
                <input
                  type="number"
                  value={actualDuration}
                  onChange={(e) => setActualDuration(e.target.value)}
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!selectedChildGoal}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg hover:from-violet-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Activity
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  return createPortal(addModalContent, document.body);
};

function getDifficultyColor(level: number) {
  switch (level) {
    case 1:
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
    case 2:
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 3:
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
    case 4:
      return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
    case 5:
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300';
  }
}
