import React from 'react';
import ReactDOM from 'react-dom';
import './ActivityMenu.css';

import ballIcon from '../../assets/activityIcons/ball.svg';
import cartIcon from '../../assets/activityIcons/cart.svg';
import factoryIcon from '../../assets/activityIcons/factory.svg';
import foodIcon from '../../assets/activityIcons/food.svg';
import restIcon from '../../assets/activityIcons/rest.svg';

const activities = [
  { id: 'sports', name: 'Sports', icon: ballIcon },
  { id: 'shopping', name: 'Shopping', icon: cartIcon },
  { id: 'industry', name: 'Industry', icon: factoryIcon },
  { id: 'food', name: 'Food', icon: foodIcon },
  { id: 'leisure', name: 'Leisure', icon: restIcon },
  { id: 'dummy1', name: 'Dummy 1', icon: ballIcon },
  { id: 'dummy2', name: 'Dummy 2', icon: cartIcon },
  { id: 'dummy3', name: 'Dummy 3', icon: factoryIcon },
  { id: 'dummy4', name: 'Dummy 4', icon: foodIcon },
  { id: 'dummy5', name: 'Dummy 5', icon: restIcon },
];

const ActivityMenu = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  // Helper to create dummy items for mobile grid demo
  const dummyItems = Array(5).fill(null).map((_, i) => ({
      id: `dummy-${i}`,
      name: '',
      icon: null,
      isDummy: true
  }));

  return ReactDOM.createPortal(
    <>
      <div className="activity-menu-overlay" onClick={onClose} />
      
      <div className="activity-menu">
        <div className="activity-menu-header">
            <h3>Categories</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="activity-grid">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="activity-item"
              onClick={() => {
                onSelect(activity.id);
                onClose();
              }}
            >
              <div className="icon-wrapper">
                <img src={activity.icon} alt={activity.name} />
              </div>
              <span>{activity.name}</span>
            </div>
          ))}

          {/* Dummy items for mobile scroll demonstration */}
          <div className="mobile-dummy-items">
              {dummyItems.map((item) => (
                 <div key={item.id} className="activity-item dummy-item">
                     {/* Empty content */}
                 </div>
              ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ActivityMenu;
