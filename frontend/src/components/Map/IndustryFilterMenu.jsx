import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './IndustryFilterMenu.css';

const IndustryFilterMenu = ({ isOpen, onClose, industries = [], selectedIds = [], onApply }) => {
  const [localSelected, setLocalSelected] = useState([]);

  useEffect(() => {
    setLocalSelected(selectedIds || []);
  }, [selectedIds, isOpen]);

  const toggleId = (id) => {
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    if (onApply) onApply(localSelected);
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div className="filter-menu-overlay" onClick={onClose} />
      <div className="filter-menu">
        <div className="filter-menu-header">
          <h3>Фильтр по отраслям</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="filter-menu-body">
          {industries.length === 0 ? (
            <p className="filter-empty">Отрасли не найдены</p>
          ) : (
            <div className="filter-list">
              {industries.map((ind) => (
                <label key={ind.id} className="filter-item">
                  <input
                    type="checkbox"
                    checked={localSelected.includes(ind.id)}
                    onChange={() => toggleId(ind.id)}
                  />
                  <span>{ind.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="filter-menu-footer">
          <button className="filter-btn secondary" onClick={() => setLocalSelected([])}>
            Сбросить
          </button>
          <button className="filter-btn primary" onClick={handleApply}>
            Применить
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

export default IndustryFilterMenu;

