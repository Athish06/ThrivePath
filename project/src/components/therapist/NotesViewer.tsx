import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar as CalendarIcon, Brain, FileText, Clock, Plus, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SessionNote {
  notes_id: number;
  therapist_id: number;
  session_date: string;
  note_content: string;
  note_title: string | null;
  session_time: string | null;
  created_at: string;
  last_edited_at: string;
}

interface NotesViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
}

export const NotesViewer: React.FC<NotesViewerProps> = ({ open, onOpenChange, selectedDate: propSelectedDate }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(propSelectedDate);
  const [selectedNotes, setSelectedNotes] = React.useState<SessionNote[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Add note modal state
  const [showAddModal, setShowAddModal] = React.useState(false);

  // Sync selectedDate with prop
  React.useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate);
    }
  }, [propSelectedDate]);
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    note_title: '',
    note_content: '',
    session_time: ''
  });

  // Fetch all dates that have notes for calendar highlighting - no longer needed since we don't show calendar
  // React.useEffect(() => {
  //   fetchNoteDates();
  // }, [user, open]);

  React.useEffect(() => {
    fetchNotesForDate();
  }, [selectedDate, user]);

  const fetchNotesForDate = async () => {
    if (!selectedDate || !user) {
      setSelectedNotes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const dateStr = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      const response = await fetch(`http://localhost:8000/api/notes/${dateStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const notes = await response.json();
        setSelectedNotes(notes);
      } else {
        throw new Error('Failed to fetch notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to fetch notes for this date');
      setSelectedNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!selectedDate || !formData.note_content.trim()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const noteData = {
        session_date: selectedDate.toISOString().split('T')[0],
        note_content: formData.note_content.trim(),
        note_title: formData.note_title.trim() || null,
        session_time: formData.session_time || null
      };

      const response = await fetch('http://localhost:8000/api/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData)
      });

      if (response.ok) {
        // Reset form
        setFormData({
          note_title: '',
          note_content: '',
          session_time: ''
        });
        setShowAddModal(false);
        
        // Refresh data
        await fetchNotesForDate();
      } else {
        throw new Error('Failed to create note');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      setError('Failed to create note');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return null;
    try {
      // Handle both HH:MM:SS and HH:MM formats
      const timeParts = timeStr.split(':');
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      
      const date = new Date();
      date.setHours(hours, minutes);
      
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeStr;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
          <Dialog.Portal forceMount>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            </motion.div>
            <Dialog.Content asChild>
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed inset-0 z-50 m-auto flex flex-col h-fit max-h-[98vh] w-[95vw] max-w-6xl rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 shadow-2xl overflow-hidden"
              >
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
                    className="absolute bottom-10 left-10 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 blur-2xl"
                  />
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between p-8 border-b border-slate-200/50 dark:border-slate-700/50">
                  <Dialog.Title className="flex items-center gap-4 text-2xl font-bold text-slate-800 dark:text-white">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div>
                      Neural Session Notes
                      <p className="text-sm font-normal text-slate-600 dark:text-slate-400 mt-1">
                        Cognitive Enhancement Archive
                      </p>
                    </div>
                  </Dialog.Title>
                  
                  <Dialog.Close asChild>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </motion.button>
                  </Dialog.Close>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 overflow-hidden">
                  <div className="h-full">
                    {/* Notes Panel - Full Width */}
                    <div className="bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50 h-full">
                      <div className="p-6 h-full flex flex-col">
                        {selectedDate ? (
                          <>
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                  <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-800 dark:text-white">
                                    {selectedDate?.toLocaleDateString('en-US', { 
                                      month: 'long', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}
                                  </h3>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {loading ? 'Loading...' : `${selectedNotes.length} session note${selectedNotes.length !== 1 ? 's' : ''}`}
                                  </p>
                                </div>
                              </div>
                              
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium hover:from-violet-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                              >
                                <Plus className="h-4 w-4" />
                                Add Note
                              </motion.button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto space-y-4">
                              {loading ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                                </div>
                              ) : error ? (
                                <div className="text-center py-8">
                                  <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                                    <X className="h-8 w-8 text-red-500 dark:text-red-400" />
                                  </div>
                                  <p className="text-red-600 dark:text-red-400">{error}</p>
                                </div>
                              ) : (
                                <AnimatePresence>
                                  {selectedNotes.map((note, index) => (
                                    <motion.div
                                      key={note.notes_id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50"
                                    >
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                            <Brain className="h-4 w-4" />
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-800 dark:text-white text-sm">
                                              {note.note_title || 'Session Note'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                              Neural Session Note
                                            </p>
                                          </div>
                                        </div>
                                        {note.session_time && (
                                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                            <Clock className="h-3 w-3" />
                                            {formatTime(note.session_time)}
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                                        {note.note_content}
                                      </p>
                                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                        <span>
                                          Created: {formatDate(note.created_at)}
                                        </span>
                                        {note.created_at !== note.last_edited_at && (
                                          <span>
                                            Edited: {formatDate(note.last_edited_at)}
                                          </span>
                                        )}
                                      </div>
                                    </motion.div>
                                  ))}
                                  
                                  {selectedNotes.length === 0 && !loading && !error && (
                                    <div className="text-center py-8">
                                      <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                        <FileText className="h-8 w-8 text-slate-400" />
                                      </div>
                                      <p className="text-slate-500 dark:text-slate-400 mb-3">No notes for this date</p>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowAddModal(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                                      >
                                        <Plus className="h-4 w-4" />
                                        Add First Note
                                      </motion.button>
                                    </div>
                                  )}
                                </AnimatePresence>
                              )}
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
      
      {/* Add Note Modal */}
      {showAddModal && (
        <Dialog.Root open={showAddModal} onOpenChange={setShowAddModal}>
          <Dialog.Portal forceMount>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
            </motion.div>
            <Dialog.Content asChild>
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed inset-0 z-[60] m-auto flex flex-col h-fit max-h-[90vh] w-[90vw] max-w-2xl rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="relative z-10 flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                  <Dialog.Title className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-white">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white">
                      <Plus className="h-5 w-5" />
                    </div>
                    Create New Session Note
                  </Dialog.Title>
                  
                  <Dialog.Close asChild>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </motion.button>
                  </Dialog.Close>
                </div>

                {/* Form */}
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Date Info */}
                    <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/50">
                      <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="font-medium">
                          {selectedDate?.toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Note Title */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Note Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.note_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, note_title: e.target.value }))}
                        placeholder="Enter a title for this session note..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Session Time */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Session Time (Optional)
                      </label>
                      <input
                        type="time"
                        value={formData.session_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, session_time: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Note Content */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Session Notes *
                      </label>
                      <textarea
                        value={formData.note_content}
                        onChange={(e) => setFormData(prev => ({ ...prev, note_content: e.target.value }))}
                        placeholder="Enter your session notes here..."
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex justify-end gap-3">
                    <Dialog.Close asChild>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel
                      </motion.button>
                    </Dialog.Close>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={createNote}
                      disabled={!formData.note_content.trim() || saving}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium hover:from-violet-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Note
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
};
