import React from 'react';

/**
 * Base shimmer primitive — a single animated bar.
 * All shimmer components compose from this.
 */
interface ShimmerBarProps {
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
}

export const ShimmerBar: React.FC<ShimmerBarProps> = React.memo(
  ({ width = 'w-full', height = 'h-4', rounded = 'rounded', className = '' }) => (
    <div className={`${width} ${height} ${rounded} shimmer-effect ${className}`} />
  )
);

ShimmerBar.displayName = 'ShimmerBar';

/**
 * Shimmer circle — avatar / icon placeholder.
 */
interface ShimmerCircleProps {
  size?: string;
  className?: string;
}

export const ShimmerCircle: React.FC<ShimmerCircleProps> = React.memo(
  ({ size = 'w-10 h-10', className = '' }) => (
    <div className={`${size} rounded-full shimmer-effect flex-shrink-0 ${className}`} />
  )
);

ShimmerCircle.displayName = 'ShimmerCircle';
