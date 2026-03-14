import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import './CustomSelect.css';

const CustomSelect = ({ options, value, onChange, placeholder = "Select an option", label, className = "", dropdownClassName = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    const selectedOption = (value !== '' && value !== null && value !== undefined)
        ? options.find(opt => opt.value === value)
        : null;

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="custom-select-container" ref={containerRef}>
            {label && <label className="custom-select-label">{label}</label>}

            <div
                className={`custom-select-trigger ${isOpen ? 'active' : ''} ${value ? 'has-value' : ''} ${className}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="custom-select-trigger-content">
                    {selectedOption ? (
                        <span className="selected-text">{selectedOption.label}</span>
                    ) : (
                        <span className="placeholder-text">{placeholder}</span>
                    )}
                </div>
                <div className="custom-select-icon">
                    <ChevronDown size={18} className={isOpen ? 'rotate-180' : ''} />
                </div>
            </div>

            {isOpen && (
                <div className={`custom-select-dropdown animate-scale-up ${dropdownClassName}`}>
                    <div className="custom-select-search-wrapper" onClick={e => e.stopPropagation()}>
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            className="custom-select-search-input"
                            placeholder={`Search ${label || placeholder || 'options'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                        {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm('')}>
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="custom-select-options-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    <span className="option-label">{option.label}</span>
                                    {value === option.value && <Check size={16} className="check-icon" />}
                                </div>
                            ))
                        ) : (
                            <div className="no-options">No results found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
