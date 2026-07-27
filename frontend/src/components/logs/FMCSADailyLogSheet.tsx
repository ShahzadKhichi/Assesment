import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DailyLogItem } from '../../services/api/logApi';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';

interface FMCSADailyLogSheetProps {
  log: DailyLogItem;
  carrierName?: string;
  mainOfficeAddress?: string;
  driverName?: string;
  vehicleNumbers?: string;
  onDownloadPDF?: (logId: string) => void;
}

export const FMCSADailyLogSheet: React.FC<FMCSADailyLogSheetProps> = React.memo(({
  log,
  carrierName = 'Apex Interstate Freight Lines LLC',
  mainOfficeAddress = '100 Logistics Way, Richmond, VA 23219',
  driverName = 'John E. Doe',
  vehicleNumbers = 'Tractor #1042 / Trailer #5308',
  onDownloadPDF
}) => {
  // Construct 24-hour duty status intervals for graph grid drawing
  // Duty rows: 0 = Off Duty, 1 = Sleeper Berth, 2 = Driving, 3 = On Duty (Not Driving)
  const dutySegments = useMemo(() => {
    // Standard daily breakdown matching HOS limits
    const off = log.off_duty_hours || 10.0;
    const sleeper = log.sleeper_berth_hours || 0.0;
    const driving = log.driving_hours || 11.0;
    const onDuty = log.on_duty_not_driving_hours || (24.0 - off - sleeper - driving);

    // Timeline segments across 24h:
    // 00:00 to Off: Off Duty (row 0)
    // Off to Off+OnDuty/2: On Duty Not Driving (row 3)
    // Off+OnDuty/2 to Off+OnDuty/2+Driving: Driving (row 2)
    // ... etc.
    const segments: { startHour: number; endHour: number; row: number }[] = [];

    let current = 0.0;

    // Segment 1: Off Duty morning rest
    const morningOff = Math.min(off, 10.0);
    if (morningOff > 0) {
      segments.push({ startHour: current, endHour: current + morningOff, row: 0 });
      current += morningOff;
    }

    // Segment 2: On-Duty inspection / pickup
    const startOnDuty = Math.min(onDuty, 1.0);
    if (startOnDuty > 0) {
      segments.push({ startHour: current, endHour: current + startOnDuty, row: 3 });
      current += startOnDuty;
    }

    // Segment 3: Driving
    if (driving > 0) {
      const drive1 = Math.min(driving, 8.0);
      segments.push({ startHour: current, endHour: current + drive1, row: 2 });
      current += drive1;

      // 30-min break if driven > 8 hrs
      if (driving > 8.0) {
        segments.push({ startHour: current, endHour: current + 0.5, row: 0 });
        current += 0.5;

        const drive2 = driving - drive1;
        segments.push({ startHour: current, endHour: current + drive2, row: 2 });
        current += drive2;
      }
    }

    // Segment 4: Sleeper Berth if any
    if (sleeper > 0) {
      segments.push({ startHour: current, endHour: current + sleeper, row: 1 });
      current += sleeper;
    }

    // Remaining time: Off Duty
    if (current < 24.0) {
      segments.push({ startHour: current, endHour: 24.0, row: 0 });
    }

    return segments;
  }, [log]);

  // SVG Drawing calculations
  // Grid Dimensions: width = 720px, height = 120px (30px per row)
  // X range: 0 to 720 (30px per hour, 7.5px per 15-min)
  // Y positions for rows 0, 1, 2, 3: row * 30 + 15
  const getX = (hour: number) => Math.min(720, Math.max(0, hour * 30));
  const getY = (row: number) => row * 30 + 15;

  // Generate SVG polyline path string connecting status lines and step vertical lines
  const svgPathD = useMemo(() => {
    if (dutySegments.length === 0) return '';
    let path = `M ${getX(dutySegments[0].startHour)} ${getY(dutySegments[0].row)}`;

    dutySegments.forEach((seg, idx) => {
      const x1 = getX(seg.startHour);
      const x2 = getX(seg.endHour);
      const y = getY(seg.row);

      // Horizontal line across segment duration
      path += ` L ${x2} ${y}`;

      // Vertical connector to next segment if not last
      if (idx < dutySegments.length - 1) {
        const nextY = getY(dutySegments[idx + 1].row);
        path += ` L ${x2} ${nextY}`;
      }
    });

    return path;
  }, [dutySegments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-300 shadow-md font-sans space-y-6 max-w-4xl mx-auto"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-900 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            Driver's Daily Log <span className="text-sm font-normal text-slate-600">(24 Hours)</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Original - File at home terminal | Duplicate - Driver retains in possession for 8 days
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-semibold">LOG DATE</span>
            <span className="text-base font-bold text-teal-800">
              {new Date(log.created_at || Date.now()).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              })}
            </span>
          </div>
          {onDownloadPDF && (
            <button
              onClick={() => onDownloadPDF(log.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow transition"
            >
              <DownloadIcon fontSize="small" />
              <span>PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Driver & Carrier Metadata Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <div className="border-b border-slate-300 pb-1">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Carrier Name</span>
            <span className="font-bold text-slate-900 text-sm">{carrierName}</span>
          </div>
          <div className="border-b border-slate-300 pb-1">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Main Office Address</span>
            <span className="font-semibold text-slate-800">{mainOfficeAddress}</span>
          </div>
          <div className="border-b border-slate-300 pb-1">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Driver Name & Signature</span>
            <span className="font-bold text-teal-900 text-sm font-serif italic">{driverName}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-slate-300 rounded p-2 bg-slate-50 text-center">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Miles Today</span>
              <span className="text-base font-extrabold text-slate-900">
                {log.total_miles_driven?.toFixed(0) || '0'} mi
              </span>
            </div>
            <div className="border border-slate-300 rounded p-2 bg-slate-50 text-center">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Mileage Today</span>
              <span className="text-base font-extrabold text-teal-800">
                {log.total_miles_driven?.toFixed(0) || '0'} mi
              </span>
            </div>
          </div>
          <div className="border-b border-slate-300 pb-1">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Tractor / Trailer Numbers</span>
            <span className="font-semibold text-slate-800">{vehicleNumbers}</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Graph Grid Drawing Section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
          <span>FMCSA 24-HOUR RECORD OF DUTY STATUS GRAPH GRID</span>
          <span className="text-teal-700">Day {log.day_number}</span>
        </div>

        <div className="border-2 border-slate-900 rounded-lg overflow-x-auto bg-white">
          <div className="min-w-[840px] p-2">
            {/* Grid Hours Label Header */}
            <div className="flex items-center text-[10px] font-bold bg-slate-900 text-white py-1 px-1 rounded-t">
              <div className="w-32 px-2 text-left">DUTY STATUS</div>
              <div className="flex-1 grid grid-cols-24 text-center">
                {['Mid', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Noon', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].map((h, i) => (
                  <span key={i}>{h}</span>
                ))}
              </div>
              <div className="w-16 text-center">TOTAL</div>
            </div>

            {/* Main Graph Grid Body */}
            <div className="flex items-stretch relative border border-slate-800">
              {/* Row Labels Left Column */}
              <div className="w-32 bg-slate-100 divide-y divide-slate-300 text-[11px] font-bold text-slate-800 flex flex-col justify-around px-2 py-0 border-r border-slate-800">
                <div className="h-[30px] flex items-center">1. Off Duty</div>
                <div className="h-[30px] flex items-center">2. Sleeper Berth</div>
                <div className="h-[30px] flex items-center">3. Driving</div>
                <div className="h-[30px] flex items-center">4. On Duty (Not Driving)</div>
              </div>

              {/* Central SVG Canvas Grid (720px wide x 120px high) */}
              <div className="flex-1 relative h-[120px] bg-white">
                {/* Background Grid Lines (Vertical Hour & 15-min ticks) */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 720 120" preserveAspectRatio="none">
                  {/* Row divider lines */}
                  <line x1="0" y1="30" x2="720" y2="30" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="0" y1="60" x2="720" y2="60" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="0" y1="90" x2="720" y2="90" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Vertical Hour lines & 15-min ticks */}
                  {Array.from({ length: 25 }).map((_, h) => (
                    <g key={h}>
                      <line x1={h * 30} y1="0" x2={h * 30} y2="120" stroke="#94a3b8" strokeWidth={h % 6 === 0 ? "1.5" : "0.75"} />
                      {h < 24 && (
                        <>
                          <line x1={h * 30 + 7.5} y1="0" x2={h * 30 + 7.5} y2="120" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2" />
                          <line x1={h * 30 + 15} y1="0" x2={h * 30 + 15} y2="120" stroke="#e2e8f0" strokeWidth="0.75" />
                          <line x1={h * 30 + 22.5} y1="0" x2={h * 30 + 22.5} y2="120" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2" />
                        </>
                      )}
                    </g>
                  ))}

                  {/* Red / Teal Active Duty Path Line Drawing */}
                  <path
                    d={svgPathD}
                    fill="none"
                    stroke="#00796b"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Total Hours Right Column */}
              <div className="w-16 bg-slate-50 divide-y divide-slate-300 text-xs font-extrabold text-slate-900 text-center flex flex-col justify-around border-l border-slate-800">
                <div className="h-[30px] flex items-center justify-center">{log.off_duty_hours?.toFixed(1) || '10.0'}</div>
                <div className="h-[30px] flex items-center justify-center">{log.sleeper_berth_hours?.toFixed(1) || '0.0'}</div>
                <div className="h-[30px] flex items-center justify-center text-teal-800">{log.driving_hours?.toFixed(1) || '11.0'}</div>
                <div className="h-[30px] flex items-center justify-center text-slate-700">{log.on_duty_not_driving_hours?.toFixed(1) || '3.0'}</div>
              </div>
            </div>

            {/* Total 24 Hours Sum Footer */}
            <div className="flex items-center justify-between text-xs font-black bg-slate-100 p-2 border-t border-slate-800 text-slate-900">
              <span>DAILY DUTY HOURS SUMMARY</span>
              <span className="text-teal-800">TOTAL: 24.0 HOURS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Remarks & 70-Hour / 8-Day Recap Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs pt-2 border-t border-slate-200">
        {/* Remarks Column */}
        <div className="md:col-span-7 bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 uppercase text-[11px]">Remarks & Location Duty Changes</h4>
          <ul className="space-y-1 text-slate-700 text-[11px]">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              <span><strong>00:00:</strong> Off Duty rest period at Home Terminal</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              <span><strong>06:00:</strong> On Duty (Not Driving) — Pre-trip inspection & pickup loading</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-700"></span>
              <span><strong>07:00:</strong> Driving status initiated</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span><strong>15:00:</strong> 30-Minute Rest Break / Fuel Stop</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span><strong>18:30:</strong> Destination Arrival & Post-trip inspection</span>
            </li>
          </ul>
        </div>

        {/* 70h / 8d Recap Column */}
        <div className="md:col-span-5 bg-teal-900 text-white rounded-xl p-4 space-y-2">
          <h4 className="font-bold text-teal-200 uppercase text-[11px]">70-Hour / 8-Day Rolling Recap</h4>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between border-b border-teal-800 pb-1">
              <span className="text-teal-200">A. On-Duty Hours Today:</span>
              <span className="font-bold">
                {((log.driving_hours || 0) + (log.on_duty_not_driving_hours || 0)).toFixed(1)} hrs
              </span>
            </div>
            <div className="flex justify-between border-b border-teal-800 pb-1">
              <span className="text-teal-200">B. Total Last 7 Days:</span>
              <span className="font-bold">38.5 hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-teal-200 font-semibold">C. Available Tomorrow (70h - B):</span>
              <span className="font-extrabold text-teal-300">31.5 hrs</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

FMCSADailyLogSheet.displayName = 'FMCSADailyLogSheet';
