import React, { useEffect, useState } from 'react';
import { getPointMarks } from '../../services/pointsService';
import { getUserById } from '../../services/authService';
import './ReviewsModal.css';

const API_BASE_URL = 'http://localhost:8000';

const ReviewsModal = ({ isOpen, onClose, pointId, pointName }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && pointId) {
      loadReviews();
    } else {
      setReviews([]);
      setError('');
    }
  }, [isOpen, pointId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPointMarks(pointId);
      
      // Загружаем username для каждого отзыва
      const reviewsWithUsers = await Promise.all(
        (data || []).map(async (review) => {
          try {
            // Проверяем, есть ли уже username в ответе
            if (review.username) {
              return review;
            }
            
            // Если нет, получаем пользователя по ID
            if (review.user_id) {
              const user = await getUserById(review.user_id);
              return {
                ...review,
                username: user.username || `Пользователь #${review.user_id}`,
              };
            }
            
            return review;
          } catch (err) {
            console.error(`Ошибка загрузки пользователя ${review.user_id}:`, err);
            // Если не удалось загрузить пользователя, используем дефолтное значение
            return {
              ...review,
              username: `Пользователь #${review.user_id}`,
            };
          }
        })
      );
      
      setReviews(reviewsWithUsers);
    } catch (err) {
      console.error('Ошибка загрузки отзывов:', err);
      // Не показываем ошибку, если эндпоинт просто не существует
      if (err.message && err.message.includes('404')) {
        setReviews([]);
      } else {
        setError(err.message || 'Ошибка загрузки отзывов');
        setReviews([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Дата неизвестна';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="reviews-modal-overlay" onClick={onClose}>
      <div className="reviews-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reviews-modal-header">
          <h2>Отзывы о точке: {pointName}</h2>
          <button className="reviews-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="reviews-modal-body">
          {error && <div className="reviews-error">{error}</div>}
          
          {loading ? (
            <div className="reviews-loading">Загрузка отзывов...</div>
          ) : reviews.length === 0 ? (
            <div className="reviews-empty">Отзывов пока нет</div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-meta">
                      <span className="review-user">{review.username || `Пользователь #${review.user_id}`}</span>
                      <span className="review-date">{formatDate(review.created_at)}</span>
                    </div>
                    {review.total_score && (
                      <div className="review-score">
                        Оценка: <strong>{review.total_score.toFixed(1)}</strong>
                      </div>
                    )}
                  </div>
                  
                  {review.comment && (
                    <div className="review-comment">
                      <p>{review.comment}</p>
                    </div>
                  )}
                  
                  {review.photos && review.photos.length > 0 && (
                    <div className="review-photos">
                      <div className="review-photos-grid">
                        {review.photos.map((photoUrl, index) => {
                          // Если фото - относительный путь, добавляем базовый URL бекенда
                          const fullPhotoUrl = photoUrl.startsWith('http') 
                            ? photoUrl 
                            : `${API_BASE_URL}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
                          
                          return (
                            <div key={index} className="review-photo-wrapper">
                              <img
                                src={fullPhotoUrl}
                                alt={`Фото ${index + 1}`}
                                className="review-photo"
                                onError={(e) => {
                                  console.error('Ошибка загрузки фото:', fullPhotoUrl);
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;

