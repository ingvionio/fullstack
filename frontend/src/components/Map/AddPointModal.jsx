import React, { useEffect, useState } from 'react';
import { getIndustries, getSubIndustries, createPoint } from '../../services/pointsService';
import { useAuth } from '../../contexts/AuthContext';
import { transform } from 'ol/proj';

const AddPointModal = ({ isOpen, onClose, onSubmit, initialCoordinates }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [selectedIndustryId, setSelectedIndustryId] = useState('');
  const [selectedSubIndustryId, setSelectedSubIndustryId] = useState('');
  const [industries, setIndustries] = useState([]);
  const [subIndustries, setSubIndustries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubIndustries, setLoadingSubIndustries] = useState(false);
  const [error, setError] = useState('');

  // Загружаем отрасли при открытии модалки
  useEffect(() => {
    if (isOpen) {
      loadIndustries();
      setName('');
      setSelectedIndustryId('');
      setSelectedSubIndustryId('');
      setSubIndustries([]);
      setError('');
    }
  }, [isOpen]);

  // Загружаем подотрасли при выборе отрасли
  useEffect(() => {
    if (selectedIndustryId) {
      loadSubIndustries(selectedIndustryId);
    } else {
      setSubIndustries([]);
      setSelectedSubIndustryId('');
    }
  }, [selectedIndustryId]);

  const loadIndustries = async () => {
    try {
      setLoading(true);
      const data = await getIndustries();
      setIndustries(data);
      if (data.length > 0) {
        setSelectedIndustryId(data[0].id.toString());
      }
    } catch (err) {
      setError(err.message || 'Ошибка загрузки отраслей');
    } finally {
      setLoading(false);
    }
  };

  const loadSubIndustries = async (industryId) => {
    try {
      setLoadingSubIndustries(true);
      const data = await getSubIndustries(industryId);
      setSubIndustries(data);
      if (data.length > 0) {
        setSelectedSubIndustryId(data[0].id.toString());
      } else {
        setSelectedSubIndustryId('');
      }
    } catch (err) {
      setError(err.message || 'Ошибка загрузки подотраслей');
      setSubIndustries([]);
    } finally {
      setLoadingSubIndustries(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedIndustryId || !selectedSubIndustryId) {
      setError('Пожалуйста, выберите отрасль и подотрасль');
      return;
    }

    if (!user?.id) {
      setError('Пользователь не авторизован');
      return;
    }

    if (!initialCoordinates || !Array.isArray(initialCoordinates) || initialCoordinates.length < 2) {
      setError('Координаты не указаны');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Преобразуем координаты из проекции карты (EPSG:3857) в градусы (EPSG:4326)
      // OpenLayers по умолчанию использует EPSG:3857 (Web Mercator), где координаты в метрах
      // Бекенд ожидает EPSG:4326 (WGS84), где координаты в градусах
      const transformedCoords = transform(
        initialCoordinates,
        'EPSG:3857', // Проекция карты (Web Mercator)
        'EPSG:4326'  // Географические координаты (градусы)
      );

      const longitude = parseFloat(transformedCoords[0]);
      const latitude = parseFloat(transformedCoords[1]);

      if (isNaN(latitude) || isNaN(longitude)) {
        setError('Некорректные координаты');
        setLoading(false);
        return;
      }

      // Проверяем, что координаты в допустимых пределах
      if (latitude < -90 || latitude > 90) {
        setError('Широта должна быть от -90 до 90 градусов');
        setLoading(false);
        return;
      }

      if (longitude < -180 || longitude > 180) {
        setError('Долгота должна быть от -180 до 180 градусов');
        setLoading(false);
        return;
      }

      const pointData = {
        name: name.trim(),
        latitude: latitude,
        longitude: longitude,
        industry_id: parseInt(selectedIndustryId),
        sub_industry_id: parseInt(selectedSubIndustryId),
        creator_id: parseInt(user.id),
      };

      console.log('Отправка данных точки:', pointData);
      const createdPoint = await createPoint(pointData);
      console.log('Точка успешно создана:', createdPoint);
      
      setLoading(false);
      onSubmit(createdPoint);
      onClose();
    } catch (err) {
      console.error('Ошибка создания точки:', err);
      setError(err.message || 'Ошибка создания точки');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Добавить новую точку</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label>Название:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={styles.input}
              placeholder="Введите название точки"
            />
          </div>
          <div style={styles.field}>
            <label>Отрасль:</label>
            <select 
              value={selectedIndustryId} 
              onChange={(e) => setSelectedIndustryId(e.target.value)}
              style={styles.select}
              required
              disabled={loading || industries.length === 0}
            >
              <option value="">Выберите отрасль</option>
              {industries.map(industry => (
                <option key={industry.id} value={industry.id}>{industry.name}</option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label>Подотрасль:</label>
            <select 
              value={selectedSubIndustryId} 
              onChange={(e) => setSelectedSubIndustryId(e.target.value)}
              style={styles.select}
              required
              disabled={!selectedIndustryId || loadingSubIndustries || subIndustries.length === 0}
            >
              <option value="">
                {!selectedIndustryId 
                  ? 'Сначала выберите отрасль' 
                  : loadingSubIndustries 
                    ? 'Загрузка...' 
                    : subIndustries.length === 0
                      ? 'Нет подотраслей'
                      : 'Выберите подотрасль'}
              </option>
              {subIndustries.map(subIndustry => (
                <option key={subIndustry.id} value={subIndustry.id}>{subIndustry.name}</option>
              ))}
            </select>
          </div>
          <div style={styles.buttons}>
             <button 
               type="button" 
               onClick={onClose} 
              disabled={loading}
              style={{
                ...styles.button,
                ...styles.buttonCancel,
                ...(loading ? styles.buttonDisabled : {}),
              }}
            >
              Отмена
            </button>
             <button 
               type="submit" 
               disabled={loading || !selectedIndustryId || !selectedSubIndustryId}
               style={{
                 ...styles.button,
                 ...styles.buttonSubmit,
                 ...((loading || !selectedIndustryId || !selectedSubIndustryId) ? styles.buttonDisabled : {}),
               }}
             >
               {loading ? 'Сохранение...' : 'Сохранить'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '400px',
    maxWidth: '90vw',
    color: 'black',
  },
  field: {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  input: {
    padding: '8px',
    marginTop: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  select: {
    padding: '8px',
    marginTop: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonCancel: {
    background: '#f7fafc',
    color: '#2d3748',
    border: '2px solid #e2e8f0',
  },
  buttonSubmit: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    backgroundColor: '#fed7d7',
    border: '1px solid #fc8181',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '15px',
    color: '#c53030',
    fontSize: '14px',
  },
};

export default AddPointModal;

