
import React, { useState, useEffect } from "react";
import { apiCache } from "../utils/api";

const CharacterModal = ({ character, onClose, imgUrl }) => {
    const [homeworldData, setHomeworldData] = useState(null);
    const [loading, setLoading] = useState(true);
    // Formatted Date
    const formatDate = (isoString) => {
        if (!isoString) return "Unknown";
        const date = new Date(isoString);
        return date.toLocaleDateString("en-GB").replace(/\//g, "-");
    };

    useEffect(() => {
        const fetchHomeworld = async () => {
            if (!character.homeworld) {
                setLoading(false);
                return;
            }

            const homeworldUrl = character.homeworld.replace('http:', 'https:');

            // Check cache first
            if (apiCache.planets[character.homeworld] && typeof apiCache.planets[character.homeworld] === 'object') {
                setHomeworldData(apiCache.planets[character.homeworld]);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(homeworldUrl);
                const data = await res.json();
                // Update cache
                apiCache.planets[character.homeworld] = data;
                setHomeworldData(data);
            } catch (error) {
                console.error("Failed to fetch homeworld", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeworld();
    }, [character]);

    if (!character) return null;

    // Format Height (cm to m)
    const heightInMeters = character.height !== 'unknown' ? (character.height / 100).toFixed(2) + " meters" : "Unknown";

    return (
        <div
            className="modal show d-block"
            style={{
                backgroundColor: "rgba(0,0,0,0.8)",
                backdropFilter: "blur(5px)",
                zIndex: 1055,
            }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered modal-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content overflow-hidden border-0 shadow-lg" style={{ borderRadius: '1rem' }}>
                    {/* Header Image Section */}
                    <div className="position-relative" style={{ height: '250px' }}>
                        <img
                            src={imgUrl}
                            alt={character.name || "image"}
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/800x400/212529/ffffff?text=Image+Not+Found';
                            }}
                        />
                        {/* Gradient Style */}
                        <div className="position-absolute top-0 start-0 w-100 h-100"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }}>
                        </div>
                        {/* Close Button */}
                        <button
                            type="button"
                            className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                            onClick={onClose}
                        />
                        {/* Character Name & Date Added */}
                        <div className="position-absolute bottom-0 start-0 p-4 text-white">
                            <h1 className="fw-bold mb-0 text-shadow display-5">{character.name}</h1>
                            <span className="badge bg-light text-dark opacity-75 mt-2">
                                Date Added: {formatDate(character.created)}
                            </span>
                        </div>
                    </div>
                    <div className="modal-body p-4 bg-white">
                        <div className="row g-5">
                            {/* Character Stats */}
                            <div className="col-md-6 border-end-md">
                                <h5 className="text-uppercase text-muted fw-bold mb-4 small">Character Stats</h5>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                        <span className="text-secondary">Height</span>
                                        <span className="fw-semibold text-dark">{heightInMeters}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                        <span className="text-secondary">Mass</span>
                                        <span className="fw-semibold text-dark">{character.mass} kg</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                        <span className="text-secondary">Birth Year</span>
                                        <span className="fw-semibold text-dark">{character.birth_year}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                        <span className="text-secondary">Number of Films</span>
                                        <span className="badge bg-primary rounded-pill">{character.films.length}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Homeworld Details */}
                            <div className="col-md-6">
                                <h5 className="text-uppercase text-muted fw-bold mb-4 small">Homeworld Details</h5>
                                {loading ? (
                                    <div className="d-flex justify-content-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </div>
                                ) : homeworldData ? (
                                    <div className="bg-light p-3 rounded-3 border">
                                        <div className="mb-3">
                                            <span className="d-block text-secondary small">Name</span>
                                            <h4 className="fw-bold text-dark mb-0">{homeworldData.name}</h4>
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <span className="d-block text-secondary small">Terrain</span>
                                                <span className="fw-semibold text-dark">{homeworldData.terrain}</span>
                                            </div>
                                            <div className="col-6">
                                                <span className="d-block text-secondary small">Climate</span>
                                                <span className="fw-semibold text-dark">{homeworldData.climate}</span>
                                            </div>
                                            <div className="col-12">
                                                <span className="d-block text-secondary small">Population</span>
                                                <span className="fw-semibold text-dark">{homeworldData.population}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-muted text-center py-3">Homeworld information unavailable</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterModal;
