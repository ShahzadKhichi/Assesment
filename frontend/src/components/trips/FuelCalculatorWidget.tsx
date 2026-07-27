import React from 'react';
import { motion } from 'framer-motion';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Co2Icon from '@mui/icons-material/Co2';
import SpeedIcon from '@mui/icons-material/Speed';

interface FuelCalculatorProps {
  totalDistanceMiles: number;
}

export const FuelCalculatorWidget: React.FC<FuelCalculatorProps> = ({ totalDistanceMiles }) => {
  // Commercial Class 8 Truck Assumptions: 6.5 MPG average, $3.85/gal Diesel
  const avgMpg = 6.5;
  const dieselPricePerGallon = 3.85;
  
  const gallonsNeeded = Math.round(totalDistanceMiles / avgMpg);
  const estimatedFuelCost = Math.round(gallonsNeeded * dieselPricePerGallon);
  const fuelStopsRequired = Math.ceil(totalDistanceMiles / 1000);
  const estimatedCo2Tons = (gallonsNeeded * 0.01018).toFixed(2); // 10.18 kg CO2 per gal diesel

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-5 text-white rounded-2xl border border-teal-500/20 shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-teal-500/20 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
            <LocalGasStationIcon />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Commercial Fuel & Fleet Analytics</h4>
            <p className="text-[11px] text-teal-200/70">Class 8 Truck (6.5 MPG Average @ $3.85/gal)</p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 uppercase tracking-wider">
          Bonus Tool
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-center text-amber-400 mb-1">
            <LocalGasStationIcon fontSize="small" />
          </div>
          <p className="text-lg font-black text-white">{gallonsNeeded.toLocaleString()} gal</p>
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Diesel Fuel</p>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-center text-emerald-400 mb-1">
            <AttachMoneyIcon fontSize="small" />
          </div>
          <p className="text-lg font-black text-emerald-400">${estimatedFuelCost.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Fuel Expenses</p>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-center text-cyan-400 mb-1">
            <SpeedIcon fontSize="small" />
          </div>
          <p className="text-lg font-black text-white">{fuelStopsRequired} Stop{fuelStopsRequired > 1 ? 's' : ''}</p>
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Every 1,000 Mi</p>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-center text-teal-400 mb-1">
            <Co2Icon fontSize="small" />
          </div>
          <p className="text-lg font-black text-teal-300">{estimatedCo2Tons} Tons</p>
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Est. CO₂ Footprint</p>
        </div>
      </div>
    </motion.div>
  );
};
