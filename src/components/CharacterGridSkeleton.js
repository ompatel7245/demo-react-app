
import React from 'react';

const CharacterGridSkeleton = () => {
    const skeletons = Array(4).fill(0);
    return (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {skeletons.map((_, i) => (
                <div key={i} className="col">
                    <div className="card h-100 border-0 shadow-sm bg-white overflow-hidden" aria-hidden="true">
                        <div className="placeholder-glow w-100 h-100">
                            <div className="placeholder w-100 bg-secondary" style={{ height: '250px', objectFit: 'cover' }}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CharacterGridSkeleton;
