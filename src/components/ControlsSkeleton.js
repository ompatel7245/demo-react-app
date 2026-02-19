
import React from 'react';

const ControlsSkeleton = () => {
    return (
        <div className="row g-3 placeholder-glow">
            {/* Search Skeleton */}
            <div className="col-12 col-md-3">
                <span className="placeholder col-4 mb-2"></span>
                <span className="placeholder col-12 py-3 rounded bg-secondary opacity-25"></span>
            </div>
            {/* Planet Skeleton */}
            <div className="col-12 col-md-3">
                <span className="placeholder col-4 mb-2"></span>
                <span className="placeholder col-12 py-3 rounded bg-secondary opacity-25"></span>
            </div>
            {/* Species Skeleton */}
            <div className="col-6 col-md-2">
                <span className="placeholder col-4 mb-2"></span>
                <span className="placeholder col-12 py-3 rounded bg-secondary opacity-25"></span>
            </div>
            {/* Film Skeleton */}
            <div className="col-6 col-md-2">
                <span className="placeholder col-4 mb-2"></span>
                <span className="placeholder col-12 py-3 rounded bg-secondary opacity-25"></span>
            </div>
            {/* Reset Skeleton */}
            <div className="col-12 col-md-2 d-flex align-items-end">
                <span className="placeholder col-12 py-3 rounded bg-danger opacity-50"></span>
            </div>
        </div>
    );
};

export default ControlsSkeleton;
