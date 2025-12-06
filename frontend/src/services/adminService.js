// API сервис для админ-панели

const API_BASE_URL = 'http://localhost:8000'; // Базовый URL бекенда

// Получить токен авторизации
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Базовые заголовки с авторизацией
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * КРИТЕРИИ (CRITERIA)
 */

/**
 * Получить критерии для отрасли
 * @param {number} industryId - ID отрасли
 * @returns {Promise<Array>} - Список критериев
 */
export const getCriteriaByIndustry = async (industryId) => {
  try {
    const url = industryId 
      ? `${API_BASE_URL}/api/v1/criteria?industry_id=${industryId}`
      : `${API_BASE_URL}/api/v1/criteria`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
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
 * Создать новый критерий
 * @param {Object} criteriaData - Данные критерия { text, industry_id }
 * @returns {Promise<Object>} - Созданный критерий
 */
export const createCriterion = async (criteriaData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/criteria`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(criteriaData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка создания критерия';
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
 * Удалить критерий
 * @param {number} criterionId - ID критерия
 * @returns {Promise<void>}
 */
export const deleteCriterion = async (criterionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/criteria/${criterionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка удаления критерия';
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Ошибка подключения к серверу. Проверьте, что бекенд запущен.');
  }
};

/**
 * ОТРАСЛИ (INDUSTRIES)
 */

/**
 * Создать новую отрасль
 * @param {Object} industryData - Данные отрасли { name }
 * @returns {Promise<Object>} - Созданная отрасль
 */
export const createIndustry = async (industryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/industries`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(industryData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка создания отрасли';
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
 * Удалить отрасль
 * @param {number} industryId - ID отрасли
 * @returns {Promise<void>}
 */
export const deleteIndustry = async (industryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/industries/${industryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка удаления отрасли';
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Ошибка подключения к серверу. Проверьте, что бекенд запущен.');
  }
};

/**
 * ПОДОТРАСЛИ (SUB-INDUSTRIES)
 */

/**
 * Создать новую подотрасль
 * @param {Object} subIndustryData - Данные подотрасли { name, industry_id, base_score }
 * @returns {Promise<Object>} - Созданная подотрасль
 */
export const createSubIndustry = async (subIndustryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/sub-industries`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(subIndustryData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка создания подотрасли';
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
 * Удалить подотрасль
 * @param {number} subIndustryId - ID подотрасли
 * @returns {Promise<void>}
 */
export const deleteSubIndustry = async (subIndustryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/sub-industries/${subIndustryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка удаления подотрасли';
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Ошибка подключения к серверу. Проверьте, что бекенд запущен.');
  }
};

/**
 * АНАЛИТИКА (ANALYTICS)
 */

const buildAnalyticsParams = (startDate, endDate, topLimit, includeTopLimit = false) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (includeTopLimit && topLimit) params.append('top_limit', topLimit);
  const query = params.toString();
  return query ? `?${query}` : '';
};

export const getActivityMetrics = async (startDate, endDate, topLimit = 10) => {
  const query = buildAnalyticsParams(startDate, endDate, topLimit, false);
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/user-activity${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || errorData.message || 'Ошибка получения метрик активности';
    throw new Error(errorMessage);
  }
  return response.json();
};

export const getPointsMetrics = async (startDate, endDate, topLimit = 10) => {
  const query = buildAnalyticsParams(startDate, endDate, topLimit, true);
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/points-overview${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || errorData.message || 'Ошибка получения метрик точек';
    throw new Error(errorMessage);
  }
  return response.json();
};

export const getMarksMetrics = async (startDate, endDate, topLimit = 10) => {
  const query = buildAnalyticsParams(startDate, endDate, topLimit, true);
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/marks-overview${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || errorData.message || 'Ошибка получения метрик оценок';
    throw new Error(errorMessage);
  }
  return response.json();
};

export const getUsersMetrics = async (startDate, endDate, topLimit = 10) => {
  const query = buildAnalyticsParams(startDate, endDate, topLimit, true);
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/users-top${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || errorData.message || 'Ошибка получения метрик пользователей';
    throw new Error(errorMessage);
  }
  return response.json();
};

export const getCriteriaMetrics = async (startDate, endDate, topLimit = 10) => {
  const query = buildAnalyticsParams(startDate, endDate, topLimit, false);
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/criteria-scores${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || errorData.message || 'Ошибка получения метрик критериев';
    throw new Error(errorMessage);
  }
  return response.json();
};

/**
 * Топ пользователей по вовлеченности (engagement)
 * @param {string} startDate
 * @param {string} endDate
 * @param {number} topLimit
 */
export const getUsersEngagement = async (startDate, endDate, topLimit = 20) => {
  const query = buildAnalyticsParams(startDate, endDate, topLimit, true);
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/users-top/engagement${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || errorData.message || 'Ошибка получения рейтинга пользователей';
    throw new Error(errorMessage);
  }
  return response.json();
};

/**
 * Получить список всех пользователей (для уровней)
 */
export const getUsersList = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || errorData.message || 'Ошибка получения пользователей';
    throw new Error(errorMessage);
  }
  return response.json();
};

/**
 * ТОЧКИ (POINTS)
 */

/**
 * Удалить точку
 * @param {number} pointId - ID точки
 * @returns {Promise<void>}
 */
export const deletePoint = async (pointId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/points/${pointId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка удаления точки';
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Ошибка подключения к серверу. Проверьте, что бекенд запущен.');
  }
};

