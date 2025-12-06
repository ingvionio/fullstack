// API сервис для работы с точками, отраслями и подотраслями

const API_BASE_URL = 'http://localhost:8000'; // Базовый URL бекенда

/**
 * Получить список всех отраслей
 * @returns {Promise<Array>} - Список отраслей
 */
export const getIndustries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/industries`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка получения отраслей';
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
 * Получить список подотраслей для конкретной отрасли
 * @param {number} industryId - ID отрасли
 * @returns {Promise<Array>} - Список подотраслей
 */
export const getSubIndustries = async (industryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/sub-industries?industry_id=${industryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка получения подотраслей';
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
 * Получить список всех точек
 * @returns {Promise<Array>} - Список точек
 */
export const getAllPoints = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/points`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка получения точек';
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
 * Получить критерии (вопросы) для точки
 * @param {number} pointId - ID точки
 * @returns {Promise<Array>} - Список критериев (вопросов)
 */
export const getPointCriteria = async (pointId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/points/${pointId}/criteria`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка получения критериев';
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
 * Создать оценку (отзыв) для точки
 * @param {Object} markData - Данные оценки { point_id, user_id, question_ids, answers, weights, comment, photos }
 * @returns {Promise<Object>} - Созданная оценка
 */
export const createMark = async (markData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/marks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(markData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка создания оценки';
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
 * Получить все отзывы для точки
 * @param {number} pointId - ID точки
 * @returns {Promise<Array>} - Список отзывов
 */
export const getPointMarks = async (pointId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/marks?point_id=${pointId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Если эндпоинт не найден (404), возвращаем пустой массив вместо ошибки
      if (response.status === 404) {
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка получения отзывов';
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
 * Получить все отзывы пользователя
 * @param {number} userId - ID пользователя
 * @returns {Promise<Array>} - Список отзывов
 */
export const getUserMarks = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/marks?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка получения отзывов пользователя';
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
 * Получить все комментарии пользователя
 * @param {number} userId - ID пользователя
 * @returns {Promise<Array>} - Список комментариев
 */
export const getUserComments = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка получения комментариев пользователя';
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
 * Загрузить фото к отзыву
 * @param {number} markId - ID отзыва
 * @param {FileList} files - Файлы для загрузки
 * @returns {Promise<Object>} - Результат загрузки
 */
export const uploadMarkPhotos = async (markId, files) => {
  try {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/marks/${markId}/photos`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка загрузки фото';
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
 * Создать новую точку
 * @param {Object} pointData - Данные точки { name, latitude, longitude, industry_id, sub_industry_id, creator_id }
 * @returns {Promise<Object>} - Созданная точка
 */
export const createPoint = async (pointData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pointData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      const errorMessage = errorData.detail || errorData.message || 'Ошибка создания точки';
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

