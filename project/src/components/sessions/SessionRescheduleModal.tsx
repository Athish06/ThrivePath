import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import AnalogClock from '../ui/AnalogClock';
import { formatTimeToAMPM } from '../../utils/sessionScheduling';

interface SessionSummary {
  id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  student_name?: string;
}

interface SessionRescheduleModalProps {
  open: boolean;
  session: SessionSummary | null;
  onClose: () => void;
  onConfirm: (payload: { date: string; time: string }) => Promise<void> | void;
  isSubmitting?: boolean;
}

const sanitizeTime = (time: string) => {
  if (!time) return '00:00';
  return time.length >= 5 ? time.slice(0, 5) : time;
};

const getDurationMinutes = (start: string, end: string) => {
  if (!start || !end) return 60;
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startDate = new Date();
  const endDate = new Date();
  startDate.setHours(startH, startM, 0, 0);
  endDate.setHours(endH, endM, 0, 0);
  const diff = (endDate.getTime() - startDate.getTime()) / 60000;
  return diff > 0 ? diff : 60;
};

export const SessionRescheduleModal: React.FC<SessionRescheduleModalProps> = ({
  open,
  session,
  onClose,
  onConfirm,
  isSubmitting = false
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  useEffect(() => {
    if (open && session) {
      setSelectedDate(session.session_date);
      setSelectedTime(sanitizeTime(session.start_time));
    }
  }, [open, session?.id]);

  if (!open || !session) {
    return null;
  }

  const durationMinutes = getDurationMinutes(session.start_time, session.end_time);
  const formattedTime = selectedTime ? formatTimeToAMPM(selectedTime) : '';

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || isSubmitting) {
      return;
    }
    onConfirm({ date: selectedDate, time: selectedTime });
  };

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex-shrink-0 p-8 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Reschedule Session</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Update the session timing for {session.student_name || 'this learner'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close reschedule modal"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                New Session Date
              </label>
              <CustomDatePicker value={selectedDate} onChange={setSelectedDate} placeholder="Select new date" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                New Session Time
              </label>
              <div className="flex justify-center">
                <AnalogClock value={selectedTime} onChange={setSelectedTime} size={240} className="max-w-fit" />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Current schedule</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-white">
                  {session.session_date} • {formatTimeToAMPM(sanitizeTime(session.start_time))}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200/40 dark:border-violet-700/40">
                <div className="flex items-center gap-2 text-sm text-violet-700 dark:text-violet-200">
                  <Clock className="h-4 w-4" />
                  <span>Upcoming schedule</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-violet-900 dark:text-violet-100">
                  {selectedDate || 'Select a date'} • {formattedTime || 'Select a time'}
                </p>
                <p className="mt-1 text-xs text-violet-600/80 dark:text-violet-200/70">
                  Automatically keeps the same duration ({durationMinutes} min)
                </p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex justify-end gap-3 px-8 py-6 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200/50 dark:border-slate-800/50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedTime || isSubmitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl transition-all"
            >
              {isSubmitting ? 'Rescheduling...' : 'Confirm Changes'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default SessionRescheduleModal;
