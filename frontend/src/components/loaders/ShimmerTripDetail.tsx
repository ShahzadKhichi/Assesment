import React from 'react';

export const ShimmerTripDetail: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-slate-200/60 rounded-lg h-80 animate-pulse" />
        </div>

        <div className="space-y-4">
          <div className="bg-slate-200/60 rounded-lg p-4 animate-pulse h-20" />

          <div className="bg-slate-200/60 rounded-lg p-4 animate-pulse h-40" />

          <div className="bg-slate-200/60 rounded-lg p-4 animate-pulse h-32" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-slate-200/60 rounded-lg p-4 animate-pulse h-6 w-48" />
        <div className="space-y-3">
          <div className="bg-slate-200/60 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-slate-300 rounded w-3/4 mb-3" />
            <div className="h-3 bg-slate-300 rounded w-full mb-2" />
            <div className="h-3 bg-slate-300 rounded w-5/6 mb-2" />
            <div className="h-3 bg-slate-300 rounded w-2/3" />
          </div>
          <div className="bg-slate-200/60 rounded-lg p-4 animate-pulse">
            <div className="space-y-2">
              <div className="h-3 bg-slate-300 rounded w-1/2" />
              <div className="h-3 bg-slate-300 rounded w-2/3" />
              <div className="h-3 bg-slate-300 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ShimmerTripDetail.displayName = 'ShimmerTripDetail';
