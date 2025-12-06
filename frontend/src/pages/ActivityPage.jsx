import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserActivity } from '../services/gamificationService';
import './ActivityPage.css';

const ActivityPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');

  // Функция для получения иконки по типу активности
  const getActivityIcon = (type) => {
    const iconMap = {
      point_created: '📍',
      mark_created: '⭐',
      achievement_unlocked: '🏆',
    };
    return iconMap[type] || '📝';
  };

  // Функция для форматирования текста активности
  const formatActivityText = (activity) => {
    const { type, title, description } = activity;
    
    // Если есть готовый title, используем его
    if (title) {
      return title;
    }
    
    // Форматируем в зависимости от типа
    switch (type) {
      case 'point_created':
        return `Создана точка: ${description || 'Новая точка'}`;
      case 'mark_created':
        return `Оставлен отзыв: ${description || 'Новый отзыв'}`;
      case 'achievement_unlocked':
        return `Получено достижение: ${description || 'Новое достижение'}`;
      default:
        return description || 'Активность';
    }
  };

  // Функция для форматирования времени активности
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Недавно';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'минуту' : diffMins < 5 ? 'минуты' : 'минут'} назад`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'час' : diffHours < 5 ? 'часа' : 'часов'} назад`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'} назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  useEffect(() => {
    const loadActivities = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Загружаем активности (больше активностей для отдельной страницы)
        const activitiesData = await getUserActivity(user.id, 50);
        setActivities(activitiesData || []);
      } catch (err) {
        console.error('Ошибка загрузки активностей:', err);
        setError(err.message || 'Ошибка загрузки активностей');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="activity-container">
        <div className="activity-content">
          <div className="activity-card">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Загрузка...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-container">
      <div className="activity-content">
        {/* Заголовок */}
        <div className="activity-card header-card">
          <div className="activity-header-content">
            <h1>История активности</h1>
            <button 
              onClick={() => navigate('/profile')} 
              className="back-button"
            >
              ← Назад к профилю
            </button>
          </div>
        </div>

        {/* Список активностей */}
        <div className="activity-card">
          {error && (
            <div className="error-message" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}
          {activities.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
              Активности не найдены
            </p>
          ) : (
            <div className="activity-list">
              {activities.map((activity, index) => (
                <div key={activity.timestamp || index} className="activity-item">
                  <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                  <div className="activity-content">
                    <p className="activity-action">{formatActivityText(activity)}</p>
                    <p className="activity-time">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                  {activity.xp_gained !== undefined && activity.xp_gained !== null && (
                    <div className="activity-points">+{activity.xp_gained} XP</div>
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

export default ActivityPage;

