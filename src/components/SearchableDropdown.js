import React, { useState, useEffect, useRef } from 'react';

const SearchableDropdown = ({ options, value, onChange, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filterText, setFilterText] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(filterText.toLowerCase())
    );

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="position-relative" ref={wrapperRef}>
            <div
                className={`form-select ${disabled ? 'bg-secondary text-white' : 'bg-light'} border-0 text-start`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
                {selectedOption ? selectedOption.label : placeholder}
            </div>

            {isOpen && (
                <div className="position-absolute w-100 bg-white border border-secondary-subtle rounded mt-1 shadow-lg" style={{ zIndex: 1050, top: '100%' }}>
                    <div className="p-2 border-bottom">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Type to filter..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                            <button
                                key={opt.value}
                                className={`list-group-item list-group-item-action border-0 p-2 text-start w-100 ${value === opt.value ? 'bg-light fw-bold' : ''}`}
                                onClick={() => { onChange(opt.value); setIsOpen(false); setFilterText(''); }}
                            >
                                {opt.label}
                            </button>
                        )) : (
                            <div className="p-2 text-muted small text-center">No results found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
