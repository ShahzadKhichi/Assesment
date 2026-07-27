import React from 'react';
import { ShimmerBar } from './ShimmerBase';

/**
 * Shimmer skeleton for the HOS breakdown stats panel.
 */
export const HOSShimmer: React.FC = React.memo(() => (
  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4 animate-pulse">
    {/* Heading */}
    <ShimmerBar width="w-2/5" height="h-5" rounded="rounded-md" />

    {/* Stat chips */}
    <div className="grid grid-cols-3 gap-4 pt-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-50 rounded-lg p-4 space-y-2">
          <ShimmerBar width="w-3/4" height="h-3" rounded="rounded" />
          <ShimmerBar width="w-1/2" height="h-6" rounded="rounded" />
        </div>
      ))}
    </div>

    {/* Progress bar */}
    <div className="space-y-2 pt-2">
      <ShimmerBar width="w-1/3" height="h-3" rounded="rounded" />
      <ShimmerBar width="w-full" height="h-3" rounded="rounded-full" />
    </div>
  </div>
));

HOSShimmer.displayName = 'HOSShimmer';
