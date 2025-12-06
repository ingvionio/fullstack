import React, { useState, useRef, useEffect, useMemo } from 'react';
import './SearchBox.css';

const SearchBox = ({ onSearch, onMenuClick, isMenuOpen, points = [] }) => {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchBoxRef = useRef(null);
  const inputRef = useRef(null);

  // Filter points based on query - show top 6 most relevant results
  const filteredPoints = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return points
      .filter(point => point.name && point.name.toLowerCase().includes(lowerQuery))
      .sort((a, b) => {
        // Prioritize exact matches at the start
        const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
        const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 6);
  }, [query, points]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show dropdown when there are filtered results
  useEffect(() => {
    setIsDropdownOpen(filteredPoints.length > 0 && query.trim() !== '');
    setHighlightedIndex(-1);
  }, [filteredPoints, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setIsDropdownOpen(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSelectPoint = (point) => {
    setQuery(point.name);
    setIsDropdownOpen(false);
    onSearch(point.name);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen || filteredPoints.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredPoints.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredPoints.length - 1
        );
        break;
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < filteredPoints.length) {
          e.preventDefault();
          handleSelectPoint(filteredPoints[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleInputFocus = () => {
    if (filteredPoints.length > 0 && query.trim()) {
      setIsDropdownOpen(true);
    }
  };

  return (
    <div 
      ref={searchBoxRef}
      className={`search-box-container ${isMenuOpen ? 'menu-open' : ''}`}
    >
      <form 
        className="search-box"
        onSubmit={handleSearch}
      >
        {/* Menu Trigger Button */}
        <button 
          type="button" 
          className="menu-button"
          onClick={onMenuClick}
        >
          ☰
        </button>

        <input
          ref={inputRef}
          type="text"
          placeholder="Search points..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          className="search-input"
          autoComplete="off"
        />
        <button 
          type="submit" 
          className="search-button"
        >
          🔍
        </button>
      </form>

      {/* Dropdown suggestions */}
      {isDropdownOpen && (
        <ul className="search-dropdown">
          {filteredPoints.map((point, index) => (
            <li
              key={point.id}
              className={`search-dropdown-item ${highlightedIndex === index ? 'highlighted' : ''}`}
              onClick={() => handleSelectPoint(point)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className="dropdown-item-name">{point.name}</span>
              {point.mark !== null && point.mark !== undefined && (
                <span className="dropdown-item-rating">
                  ⭐ {typeof point.mark === 'number' ? point.mark.toFixed(1) : point.mark}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBox;
