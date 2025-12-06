import React, { useEffect, useState } from 'react';
import { getPointCriteria, createMark, uploadMarkPhotos } from '../../services/pointsService';
import { useAuth } from '../../contexts/AuthContext';
import './ReviewModal.css';

// Star Rating Component
const StarRating = ({ value, onChange, disabled }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (rating) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    // Only show hover effect if no value is set yet
    if (!disabled && !value) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(0);
  };

  return (
    <div className="star-rating" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverValue || value);
        return (
          <span
            key={star}
            className={`star ${isFilled ? 'star-filled' : 'star-empty'} ${disabled ? 'star-disabled' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClick(star);
              }
            }}
            aria-label={`${star} звезд`}
          >
            ★
          </span>
        );
      })}
      {value > 0 && <span className="star-rating-text">{value} из 5</span>}
    </div>
  );
};

const weightLabels = {
  1: 'Не важно',
  2: 'Мало важно',
  3: 'Средне важно',
  4: 'Важно',
  5: 'Очень важно',
};

const ReviewModal = ({ isOpen, onClose, pointId, pointName, onSubmit }) => {
  const { user } = useAuth();
  const [criteria, setCriteria] = useState([]);
  const [answers, setAnswers] = useState({}); // { criterionId: { rating: 1-5, weight: 1-5 } }
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]); // Array of File objects
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getWeightValue = (criterionId) => {
    const value = answers[criterionId]?.weight;
    if (value === '' || value === undefined || value === null) return 3;
    return value;
  };

  useEffect(() => {
    if (isOpen && pointId) {
      loadCriteria();
      setAnswers({});
      setComment('');
      setPhotos([]);
      setError('');
    }
  }, [isOpen, pointId]);

  const loadCriteria = async () => {
    try {
      setLoading(true);
      const data = await getPointCriteria(pointId);
      setCriteria(data);
      
      // Инициализируем ответы пустыми значениями
      const initialAnswers = {};
      data.forEach((criterion) => {
        initialAnswers[criterion.id] = {
          rating: '',
          weight: 3,
        };
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error('Ошибка загрузки критериев:', err);
      setError(err.message || 'Ошибка загрузки вопросов');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (criterionId, value) => {
    setAnswers({
      ...answers,
      [criterionId]: {
        ...answers[criterionId],
        rating: value ? parseInt(value) : '',
      },
    });
  };

  const handleWeightSlide = (criterionId, value) => {
    const numeric = parseFloat(value);
    setAnswers((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        weight: Number.isNaN(numeric) ? '' : numeric,
      },
    }));
  };

  const handleWeightSnap = (criterionId) => {
    setAnswers((prev) => {
      const current = getWeightValue(criterionId);
      const snapped = Math.min(5, Math.max(1, Math.round(current)));
      return {
        ...prev,
        [criterionId]: {
          ...prev[criterionId],
          weight: snapped,
        },
      };
    });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверяем, что все вопросы отвечены
    const unanswered = criteria.filter(c => {
      const answer = answers[c.id];
      return !answer || !answer.rating || !answer.weight;
    });
    
    if (unanswered.length > 0) {
      setError('Пожалуйста, ответьте на все вопросы');
      return;
    }

    if (!user?.id) {
      setError('Пользователь не авторизован');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Формируем данные для отправки на бекенд
      const questionIds = [];
      const answerValues = [];
      const weights = [];

      criteria.forEach((criterion) => {
        const answer = answers[criterion.id];
        questionIds.push(criterion.id);
        answerValues.push(answer.rating);
        weights.push(answer.weight);
      });

      const markData = {
        point_id: parseInt(pointId),
        user_id: parseInt(user.id),
        question_ids: questionIds,
        answers: answerValues,
        weights: weights,
        comment: comment.trim() || null,
        photos: [], // Фото будут загружены отдельно после создания отзыва
      };

      console.log('Отправка оценки:', markData);
      const createdMark = await createMark(markData);
      console.log('Оценка успешно отправлена');

      // Загружаем фото, если они есть
      if (photos.length > 0 && createdMark.id) {
        try {
          await uploadMarkPhotos(createdMark.id, photos);
          console.log('Фото успешно загружены');
        } catch (photoError) {
          console.error('Ошибка загрузки фото:', photoError);
          // Не прерываем процесс, если фото не загрузились
        }
      }

      if (onSubmit) {
        onSubmit(answers);
      }
      onClose();
    } catch (err) {
      console.error('Ошибка отправки оценки:', err);
      setError(err.message || 'Ошибка отправки оценки');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h2>Оценить точку</h2>
          <button className="review-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="review-modal-body">
          <p className="review-point-name">Точка: <strong>{pointName}</strong></p>
          
          {error && <div className="review-error">{error}</div>}
          
          {loading ? (
            <div className="review-loading">Загрузка вопросов...</div>
          ) : criteria.length === 0 ? (
            <div className="review-no-questions">Нет вопросов для этой точки</div>
          ) : (
            <form onSubmit={handleSubmit} className="review-form">
              {criteria.map((criterion) => (
                <div key={criterion.id} className="review-question">
                  <label className="review-question-label">
                    {criterion.text}
                  </label>
                  <div className="review-ratings">
                    <div className="review-rating-group">
                      <label className="review-rating-label">
                        Насколько вам нравится (1-5):
                      </label>
                      <StarRating
                        value={answers[criterion.id]?.rating || 0}
                        onChange={(rating) => handleRatingChange(criterion.id, rating)}
                        disabled={submitting}
                      />
                    </div>
                    <div className="review-rating-group">
                      <label className="review-rating-label">
                        Насколько это важно для вас (1-5):
                      </label>
                      <div className="review-rating-slider-wrapper">
                        {(() => {
                          const weightValue = getWeightValue(criterion.id);
                          const roundedWeight = Math.round(weightValue);
                          return (
                            <>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                step="0.01"
                                className="review-rating-slider"
                                value={weightValue}
                                onChange={(e) => handleWeightSlide(criterion.id, e.target.value)}
                                onPointerUp={() => handleWeightSnap(criterion.id)}
                                onMouseUp={() => handleWeightSnap(criterion.id)}
                                onTouchEnd={() => handleWeightSnap(criterion.id)}
                                disabled={submitting}
                                aria-label="Важноcть критерия от 1 до 5"
                                list={`weight-ticks-${criterion.id}`}
                              />
                              <datalist id={`weight-ticks-${criterion.id}`}>
                                {[1, 2, 3, 4, 5].map((tick) => (
                                  <option key={tick} value={tick} />
                                ))}
                              </datalist>
                              <div className="review-slider-ticks">
                                {[1, 2, 3, 4, 5].map((tick) => (
                                  <div key={tick} className="review-slider-tick">
                                    <span className="review-slider-tick-dot" />
                                    <span className="review-slider-tick-label">{tick}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="review-slider-value">
                                {roundedWeight} — {weightLabels[roundedWeight]}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Комментарий */}
              <div className="review-comment-section">
                <label className="review-comment-label">
                  Комментарий (необязательно)
                </label>
                <textarea
                  className="review-comment-textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Напишите ваш отзыв..."
                  rows={4}
                  disabled={submitting}
                />
              </div>

              {/* Загрузка фото */}
              <div className="review-photos-section">
                <label className="review-photos-label">
                  Фотографии (необязательно)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="review-photos-input"
                  disabled={submitting}
                />
                {photos.length > 0 && (
                  <div className="review-photos-preview">
                    <p>Выбрано фото: {photos.length}</p>
                    <div className="review-photos-list">
                      {photos.map((photo, index) => (
                        <div key={index} className="review-photo-item">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${index + 1}`}
                            className="review-photo-preview"
                          />
                          <span className="review-photo-name">{photo.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="review-modal-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="review-button review-button-cancel"
                  disabled={submitting}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="review-button review-button-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Отправка...' : 'Отправить оценку'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

