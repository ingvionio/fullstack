import React from 'react';

const ContextMenu = ({ position, onAddPoint, onClose }) => {
  if (!position) return null;

  const style = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    zIndex: 200,
    backgroundColor: 'white',
    padding: '10px 16px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    color: '#2d3748',
    fontSize: '14px',
    fontWeight: '600',
    border: '2px solid #e2e8f0',
    transition: 'all 0.2s',
  };

  const handleMouseEnter = (e) => {
    e.target.style.backgroundColor = '#f7fafc';
    e.target.style.borderColor = '#667eea';
  };

  const handleMouseLeave = (e) => {
    e.target.style.backgroundColor = 'white';
    e.target.style.borderColor = '#e2e8f0';
  };

  return (
    <div 
      style={style} 
      onClick={onAddPoint}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      + Add point
    </div>
  );
};

export default ContextMenu;

