import React from 'react';
import { ShimmerBar } from './ShimmerBase';

/**
 * Shimmer skeleton for a Trip card — used on Dashboard & Trip list.
 */
export const TripCardShimmer: React.FC = React.memo(() => (
  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4 animate-pulse">
    {/* Title bar */}
    <div className="flex items-center justify-between">
      <ShimmerBar width="w-1/3" height="h-5" rounded="rounded-md" />
      <ShimmerBar width="w-16" height="h-6" rounded="rounded-full" />
    </div>

    {/* Location rows */}
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-3">
        <ShimmerBar width="w-8" height="h-8" rounded="rounded-lg" />
        <ShimmerBar width="w-3/5" height="h-4" rounded="rounded" />
      </div>
      <div className="flex items-center gap-3">
        <ShimmerBar width="w-8" height="h-8" rounded="rounded-lg" />
        <ShimmerBar width="w-1/2" height="h-4" rounded="rounded" />
      </div>
      <div className="flex items-center gap-3">
        <ShimmerBar width="w-8" height="h-8" rounded="rounded-lg" />
        <ShimmerBar width="w-2/5" height="h-4" rounded="rounded" />
      </div>
    </div>

    {/* Stats row */}
    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
      <ShimmerBar width="w-20" height="h-4" rounded="rounded" />
      <ShimmerBar width="w-24" height="h-4" rounded="rounded" />
      <ShimmerBar width="w-16" height="h-4" rounded="rounded" />
    </div>

    {/* Action button */}
    <ShimmerBar width="w-full" height="h-10" rounded="rounded-lg" />
  </div>
));

TripCardShimmer.displayName = 'TripCardShimmer';

/**
 * Renders N trip card shimmers in a grid.
 */
export const TripListShimmer: React.FC<{ count?: number }> = React.memo(({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <TripCardShimmer key={i} />
    ))}
  </div>
));

TripListShimmer.displayName = 'TripListShimmer';
