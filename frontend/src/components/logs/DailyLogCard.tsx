import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { downloadLogPDF } from '../../store/slices/logSlice';
import { DailyLogItem } from '../../services/api/logApi';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CircularProgress from '@mui/material/CircularProgress';

interface DailyLogCardProps {
  log: DailyLogItem;
}

/**
 * FMCSA-style 24-hour daily log card.
 * Shows duty status breakdown and offers PDF download.
 */
export const DailyLogCard: React.FC<DailyLogCardProps> = React.memo(({ log }) => {
  const dispatch = useAppDispatch();
  const { isDownloading } = useAppSelector((s) => s.logs);

  const handleDownload = useCallback(() => {
    dispatch(downloadLogPDF(log.id));
  }, [dispatch, log.id]);

  const dutyItems = [
    { label: 'Off Duty', value: log.off_duty_hours, color: 'text-slate-600' },
    { label: 'Sleeper Berth', value: log.sleeper_berth_hours, color: 'text-indigo-600' },
    { label: 'Driving', value: log.driving_hours, color: 'text-teal-700' },
    { label: 'On Duty (Not Driving)', value: log.on_duty_not_driving_hours, color: 'text-slate-700' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-teal-100 text-teal-700 p-1.5 rounded-lg">
            <CalendarTodayIcon fontSize="small" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Day {log.day_number}</h4>
        </div>
        <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">
          {log.total_miles_driven?.toFixed(0) || '0'} mi
        </span>
      </div>

      {/* Duty status grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {dutyItems.map((item) => (
          <div key={item.label} className="bg-slate-50 rounded-lg px-3 py-2.5">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{item.value.toFixed(1)}h</p>
          </div>
        ))}
      </div>

      {/* PDF Download */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          {new Date(log.created_at).toLocaleDateString()}
        </span>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white transition shadow-sm"
        >
          {isDownloading ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <DownloadIcon fontSize="small" />
          )}
          Download PDF
        </button>
      </div>
    </motion.div>
  );
});

DailyLogCard.displayName = 'DailyLogCard';
