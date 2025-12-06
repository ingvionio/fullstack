import React, { useRef, useEffect, useState } from 'react';
import Overlay from 'ol/Overlay';
import { toLonLat } from 'ol/proj';
import { getIndustries, getSubIndustries } from '../../services/pointsService';
import './Popup.css';

const Popup = ({ map, popupRef, data, onReviewClick, onViewReviewsClick }) => {
  // Ref to store the overlay instance so we don't recreate it unnecessarily
  const overlayInstanceRef = useRef(null);
  const contentRef = useRef(null);
  const closerRef = useRef(null);
  const [industryName, setIndustryName] = useState('');
  const [subIndustryName, setSubIndustryName] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize the Overlay ONCE when map is available
  useEffect(() => {
    if (!map || !popupRef.current) return;
    
    // If overlay already exists, don't recreate it
    if (overlayInstanceRef.current) return;

    const overlay = new Overlay({
      element: popupRef.current,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
      // Important: OpenLayers moves the element in the DOM. 
      // stopEvent: false allows clicks inside popup to propagate if needed, usually true is default.
    });
    
    map.addOverlay(overlay);
    overlayInstanceRef.current = overlay;

    // Cleanup: Remove overlay when component unmounts
    return () => {
      if (map && overlay) {
        map.removeOverlay(overlay);
        overlayInstanceRef.current = null;
      }
    };
  }, [map]); // Remove popupRef from deps to avoid re-running if ref object identity changes (it shouldn't)

  // Effect to update overlay position when data changes and load industry names
  useEffect(() => {
      if (overlayInstanceRef.current && data && data.coordinates) {
          overlayInstanceRef.current.setPosition(data.coordinates);
          
          // Загружаем названия отрасли и подотрасли
          if (data.industry_id && data.sub_industry_id) {
            setLoading(true);
            Promise.all([
              getIndustries(),
              getSubIndustries(data.industry_id)
            ]).then(([industries, subIndustries]) => {
              const industry = industries.find(i => i.id === data.industry_id);
              const subIndustry = subIndustries.find(s => s.id === data.sub_industry_id);
              setIndustryName(industry?.name || 'Неизвестная отрасль');
              setSubIndustryName(subIndustry?.name || 'Неизвестная подотрасль');
              setLoading(false);
            }).catch((error) => {
              console.error('Ошибка загрузки данных отрасли:', error);
              setIndustryName('Ошибка загрузки');
              setSubIndustryName('Ошибка загрузки');
              setLoading(false);
            });
          } else {
            setIndustryName('');
            setSubIndustryName('');
          }
      } else if (overlayInstanceRef.current && !data) {
          overlayInstanceRef.current.setPosition(undefined);
          setIndustryName('');
          setSubIndustryName('');
      }
  }, [data]);

  const closePopup = (e) => {
     e.preventDefault(); // Prevent href="#" navigation
     if (overlayInstanceRef.current) {
         overlayInstanceRef.current.setPosition(undefined);
         // Notify parent that popup is closed? 
         // Ideally we should setPopupData(null) in parent, but we can visually close it here.
         // Since data prop controls visibility via CSS, we probably want to callback to clear data.
     }
  };

  // Format coordinates to display (Lon/Lat)
  const formattedCoordinates = data && data.coordinates
    ? toLonLat(data.coordinates).map((coord) => coord.toFixed(4)).join(', ')
    : '';

  // OpenLayers moves this DOM element into its own container.
  // We must ensure React doesn't lose track of it or try to remove it from its original parent 
  // in a way that conflicts with OpenLayers.
  // React Portal is often a cleaner way to handle this, but simple ref attachment works 
  // if we are careful about unmounting.
  
  return (
    <div ref={popupRef} className="ol-popup" style={{ display: data ? 'block' : 'none' }}>
      <a href="#" className="ol-popup-closer" ref={closerRef} onClick={closePopup}></a>
      {data && (
        <div className="popup-content" ref={contentRef}>
            <h3>{data.name || 'Неизвестная точка'}</h3>
            <div className="popup-info">
              <p>
                <strong>Отрасль:</strong>{' '}
                {loading ? 'Загрузка...' : (industryName || 'Не указана')}
              </p>
              <p>
                <strong>Подотрасль:</strong>{' '}
                {loading ? 'Загрузка...' : (subIndustryName || 'Не указана')}
              </p>
              <p>
                <strong>Оценка:</strong>{' '}
                <span className="popup-mark">{data.mark || 0}</span>
              </p>
            </div>
            {data.id && (
              <div className="popup-buttons">
                <button 
                  className="popup-review-button"
                  onClick={() => onReviewClick && onReviewClick(data.id, data.name)}
                >
                  Оставить отзыв
                </button>
                <button 
                  className="popup-view-reviews-button"
                  onClick={() => onViewReviewsClick && onViewReviewsClick(data.id, data.name)}
                >
                  Посмотреть отзывы
                </button>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Popup;
