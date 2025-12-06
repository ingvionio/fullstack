// API сервис для авторизации и регистрации

const API_BASE_URL = 'http://localhost:8000'; // Базовый URL бекенда

/**
 * Регистрация нового пользователя
 * @param {Object} userData - Данные пользователя { email, password, name }
 * @returns {Promise<Object>} - { user }
 */
export const register = async (userData) => {
  try {
    // Бекенд ожидает username, email, password
    const payload = {
      username: userData.name || userData.username || userData.email.split('@')[0],
      email: userData.email,
      password: userData.password,
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Бекенд возвращает detail в формате FastAPI
      const errorMessage = errorData.detail || errorData.message || 'Ошибка регистрации';
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    
    // Формируем объект пользователя для хранения
    const user = {
      id: responseData.id,
      username: responseData.username,
      email: responseData.email,
      name: responseData.username, // Для совместимости с существующим кодом
    };
    
    // Сохраняем данные пользователя
    localStorage.setItem('user', JSON.stringify(user));
    
    // Если есть токен в ответе, сохраняем его, иначе используем временный индикатор
    if (responseData.token) {
      localStorage.setItem('authToken', responseData.token);
    } else {
      localStorage.setItem('authToken', `user_${user.id}`);
    }

    return { user };
  } catch (error) {
    // Обработка сетевых ошибок
    if (error.message) {
      throw error;
    }
    throw new Error('Ошибка подключения к серверу. Проверьте, что бекенд запущен.');
  }
};

/**
 * Авторизация пользователя
 * @param {Object} credentials - { username, password }
 * @returns {Promise<Object>} - { token, user }
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Бекенд возвращает detail в формате FastAPI
      const errorMessage = errorData.detail || errorData.message || 'Неверное имя пользователя или пароль';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Формируем объект пользователя для хранения
    const user = {
      id: data.user?.id || data.id,
      username: data.user?.username || data.username,
      email: data.user?.email || data.email,
      name: data.user?.username || data.user?.name || data.username,
    };
    
    // Сохраняем токен и данные пользователя
    if (data.token || data.access_token) {
      localStorage.setItem('authToken', data.token || data.access_token);
    }
    localStorage.setItem('user', JSON.stringify(user));

    return { 
      token: data.token || data.access_token,
      user 
    };
  } catch (error) {
    // Обработка сетевых ошибок
    if (error.message) {
      throw error;
    }
    throw new Error('Ошибка подключения к серверу. Проверьте, что бекенд запущен.');
  }
};

/**
 * Выход из системы
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

/**
 * Проверка авторизации (получение текущего пользователя)
 * @returns {Object|null} - Данные пользователя или null
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('authToken');
  
  if (user && token) {
    return JSON.parse(user);
  }
  
  return null;
};

/**
 * Получить информацию о пользователе по ID
 * @param {number} userId - ID пользователя
 * @returns {Promise<Object>} - Данные пользователя
 */
export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка получения пользователя';
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
 * Загрузить аватар пользователя
 * @param {number} userId - ID пользователя
 * @param {File} file - Файл изображения
 * @returns {Promise<Object>} - Обновленные данные пользователя
 */
export const uploadAvatar = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/avatar`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || 'Ошибка загрузки аватара';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Обновляем данные пользователя в localStorage, если это текущий пользователь
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = {
        ...currentUser,
        avatar_url: data.avatar_url,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Ошибка подключения к серверу. Проверьте, что бекенд запущен.');
  }
};

/**
 * Проверка наличия токена
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

