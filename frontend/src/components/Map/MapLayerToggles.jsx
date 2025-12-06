import React from 'react';
import './MapLayerToggles.css';

const MapLayerToggles = ({ 
  isHeatmapActive, 
  onHeatmapToggle, 
  arePointsVisible, 
  onPointsToggle 
}) => {
  return (
    <div className="map-layer-toggles">
      {/* Heatmap Toggle Button */}
      <button
        className={`layer-toggle heatmap-btn ${isHeatmapActive ? 'active' : ''}`}
        onClick={onHeatmapToggle}
        title={isHeatmapActive ? 'Скрыть тепловую карту' : 'Показать тепловую карту'}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Heat/Fire icon */}
          <path
            d="M12 23C8.5 23 4 19.5 4 14C4 9.5 7 6.5 8 5C8 7.5 9.5 9.5 12 9.5C14.5 9.5 16 7.5 16 5C18 7.5 20 9.5 20 14C20 19.5 15.5 23 12 23Z"
            fill={isHeatmapActive ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 23C13.5 23 15 21.5 15 19C15 16.5 13.5 15 12 13C10.5 15 9 16.5 9 19C9 21.5 10.5 23 12 23Z"
            fill={isHeatmapActive ? '#fff' : 'none'}
            stroke={isHeatmapActive ? '#fff' : 'currentColor'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="toggle-label">Тепловая карта</span>
      </button>

      {/* Points Visibility Toggle Button */}
      <button
        className={`layer-toggle points-btn ${arePointsVisible ? 'active' : ''}`}
        onClick={onPointsToggle}
        title={arePointsVisible ? 'Скрыть точки' : 'Показать точки'}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Map pin/marker icon */}
          <path
            d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
            fill={arePointsVisible ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="9"
            r="3"
            fill={arePointsVisible ? '#fff' : 'none'}
            stroke={arePointsVisible ? '#fff' : 'currentColor'}
            strokeWidth="1.5"
          />
        </svg>
        <span className="toggle-label">Точки</span>
      </button>
    </div>
  );
};

export default MapLayerToggles;

