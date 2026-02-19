import React from 'react';

const LoadingSkeleton = ({ className }) => {
    return (
        <div className={`bg-slate-800/50 animate-pulse rounded-xl ${className}`}></div>
    );
};

export const KPISkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} className="h-32" />)}
    </div>
);

export const ChartSkeleton = () => (
    <LoadingSkeleton className="h-64" />
);

export default LoadingSkeleton;
