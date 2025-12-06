// API сервис для геймификации и достижений

const API_BASE_URL = 'http://localhost:8000'; // Базовый URL бекенда

/**
 * Получить прогресс пользователя (уровень, XP)
 * @param {number} userId - ID пользователя
 * @returns {Promise<Object>} - Прогресс пользователя
 */
export const getUserProgress = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/gamification/users/${userId}/progress`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка получения прогресса';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Ошибка подключения к серверу. Проверьте, что бекенд запущен.');
  }
};

/**
 * Получить все достижения с прогрессом пользователя
 * @param {number} userId - ID пользователя
 * @returns {Promise<Array>} - Список достижений с прогрессом
 */
export const getUserAchievements = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/achievements/users/${userId}/achievements`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка получения достижений';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Ошибка подключения к серверу. Проверьте, что бекенд запущен.');
  }
};

/**
 * Получить последние активности пользователя
 * @param {number} userId - ID пользователя
 * @param {number} limit - Максимальное количество активностей (по умолчанию 50, максимум 100)
 * @returns {Promise<Array>} - Список активностей
 */
export const getUserActivity = async (userId, limit = 50) => {
  try {
    // Ограничиваем limit максимумом 100
    const validLimit = Math.min(Math.max(1, limit), 100);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/activity?limit=${validLimit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка получения активности';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Ошибка подключения к серверу. Проверьте, что бекенд запущен.');
  }
};

