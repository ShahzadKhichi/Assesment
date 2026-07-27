import React from 'react';
import { ShimmerBar } from './ShimmerBase';

/**
 * Shimmer skeleton for a Daily Log card (ELD log entry).
 */
export const LogCardShimmer: React.FC = React.memo(() => (
  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between">
      <ShimmerBar width="w-24" height="h-5" rounded="rounded-md" />
      <ShimmerBar width="w-20" height="h-6" rounded="rounded-full" />
    </div>

    {/* Hours grid */}
    <div className="grid grid-cols-2 gap-3 pt-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-1.5">
          <ShimmerBar width="w-2/3" height="h-3" rounded="rounded" />
          <ShimmerBar width="w-1/2" height="h-5" rounded="rounded" />
        </div>
      ))}
    </div>

    {/* Bottom action */}
    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
      <ShimmerBar width="w-28" height="h-4" rounded="rounded" />
      <ShimmerBar width="w-24" height="h-9" rounded="rounded-lg" />
    </div>
  </div>
));

LogCardShimmer.displayName = 'LogCardShimmer';

/**
 * Renders N log card shimmers.
 */
export const LogListShimmer: React.FC<{ count?: number }> = React.memo(({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <LogCardShimmer key={i} />
    ))}
  </div>
));

LogListShimmer.displayName = 'LogListShimmer';
