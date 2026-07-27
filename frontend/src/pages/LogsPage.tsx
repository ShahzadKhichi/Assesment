import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchLogs, downloadLogPDF } from '../store/slices/logSlice';
import { DailyLogCard, FMCSADailyLogSheet } from '../components/logs';
import { LogListShimmer } from '../components/shimmer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DrawIcon from '@mui/icons-material/Draw';
import GridViewIcon from '@mui/icons-material/GridView';
import PrintIcon from '@mui/icons-material/Print';
import locationReviewImg from '../assets/usefull_images/Location-review-bro.png';

const LogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { logs, isLoading, error } = useAppSelector((state) => state.logs);
  const [viewMode, setViewMode] = useState<'sheet' | 'grid'>('sheet');

  useEffect(() => {
    dispatch(fetchLogs());
  }, [dispatch]);

  const handleDownload = useCallback((logId: string) => {
    dispatch(downloadLogPDF(logId));
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
      >
        <div className="space-y-2 z-10 max-w-xl">
          <span className="text-teal-200 text-xs font-bold uppercase tracking-wider bg-teal-950/60 px-3 py-1 rounded-full border border-teal-600/40">
            FMCSA Electronic Logging Device (ELD)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Daily Driver Log Sheets & 24-Hour Graph Grids
          </h1>
          <p className="text-teal-100 text-sm">
            View 24-hour duty status graph grid drawings and export official DOT compliance PDFs.
          </p>
        </div>

        <div className="z-10 flex flex-col sm:flex-row items-center gap-4">
          <img
            src={locationReviewImg}
            alt="Duty Status Logs Review"
            className="w-44 sm:w-52 h-auto drop-shadow-2xl transform hover:scale-105 transition-transform"
          />

          {/* Controls: Print + View Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-bold text-xs shadow-lg transition flex items-center gap-1.5"
            >
              <PrintIcon fontSize="small" />
              <span>Print / Export PDF</span>
            </button>

            <div className="bg-teal-950/80 p-1.5 rounded-2xl border border-teal-600/40 flex items-center gap-1">
              <button
                onClick={() => setViewMode('sheet')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  viewMode === 'sheet'
                    ? 'bg-teal-400 text-slate-950 shadow-md'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                <DrawIcon fontSize="small" />
                <span>FMCSA Sheet</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  viewMode === 'grid'
                    ? 'bg-teal-400 text-slate-950 shadow-md'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                <GridViewIcon fontSize="small" />
                <span>Grid View</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Grid */}
      {isLoading && <LogListShimmer count={3} />}

      {!isLoading && error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-center">
          {error}
        </div>
      )}

      {!isLoading && !error && logs.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mb-4">
            <AssignmentIcon sx={{ fontSize: 32 }} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Daily Logs Generated Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            Plan a trip in the Trip Planner to automatically draw 24-hour ELD log sheets.
          </p>
        </div>
      )}

      {!isLoading && logs.length > 0 && (
        <div>
          {viewMode === 'sheet' ? (
            <div className="space-y-8">
              {logs.map((log) => (
                <FMCSADailyLogSheet
                  key={log.id}
                  log={log}
                  onDownloadPDF={handleDownload}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logs.map((log) => (
                <DailyLogCard key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LogsPage;
