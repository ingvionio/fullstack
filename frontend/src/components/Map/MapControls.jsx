import React from 'react';
import './MapControls.css';

export const MapControls = ({ mode, setMode }) => {
  return (
    <div className="map-controls">
      <button 
        onClick={() => setMode('view')} 
        className={`map-control-button ${mode === 'view' ? 'active' : ''}`}
      >
        View
      </button>
      <button 
        onClick={() => setMode('edit')} 
        className={`map-control-button ${mode === 'edit' ? 'active' : ''}`}
      >
        Edit Points
      </button>
    </div>
  );
};
