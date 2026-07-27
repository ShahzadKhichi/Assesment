import React from 'react';
import { ShimmerBar, ShimmerCircle } from './ShimmerBase';

/**
 * Shimmer skeleton for the route timeline (stop sequence).
 */
export const TimelineShimmer: React.FC = React.memo(() => (
  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5 animate-pulse">
    <ShimmerBar width="w-1/4" height="h-5" rounded="rounded-md" />

    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-start gap-4">
        {/* Circle node */}
        <div className="flex flex-col items-center">
          <ShimmerCircle size="w-8 h-8" />
          {i < 4 && <div className="w-0.5 h-10 shimmer-effect mt-1" />}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2 pt-1">
          <ShimmerBar width="w-2/3" height="h-4" rounded="rounded" />
          <ShimmerBar width="w-1/3" height="h-3" rounded="rounded" />
        </div>

        {/* Duration badge */}
        <ShimmerBar width="w-14" height="h-6" rounded="rounded-full" className="mt-1" />
      </div>
    ))}
  </div>
));

TimelineShimmer.displayName = 'TimelineShimmer';
