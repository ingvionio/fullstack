import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getCriteriaByIndustry, 
  createCriterion, 
  deleteCriterion,
  createIndustry,
  deleteIndustry,
  createSubIndustry,
  deleteSubIndustry,
  deletePoint,
  getActivityMetrics,
  getPointsMetrics,
  getMarksMetrics,
  getUsersMetrics,
  getCriteriaMetrics
} from '../services/adminService';
import { getIndustries, getSubIndustries, getAllPoints } from '../services/pointsService';
import './AdminPage.css';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('criteria'); // 'criteria', 'industries', 'sub-industries', 'points'
  
  // Criteria state
  const [criteria, setCriteria] = useState([]);
  const [criteriaLoading, setCriteriaLoading] = useState(false);
  const [criteriaError, setCriteriaError] = useState('');
  const [newCriterionText, setNewCriterionText] = useState('');
  const [selectedIndustryForCriteria, setSelectedIndustryForCriteria] = useState('');
  
  // Industries state
  const [industries, setIndustries] = useState([]);
  const [industriesLoading, setIndustriesLoading] = useState(false);
  const [industriesError, setIndustriesError] = useState('');
  const [newIndustryName, setNewIndustryName] = useState('');
  
  // Sub-industries state
  const [subIndustries, setSubIndustries] = useState([]);
  const [subIndustriesLoading, setSubIndustriesLoading] = useState(false);
  const [subIndustriesError, setSubIndustriesError] = useState('');
  const [newSubIndustryName, setNewSubIndustryName] = useState('');
  const [newSubIndustryBaseScore, setNewSubIndustryBaseScore] = useState('');
  const [selectedIndustryForSub, setSelectedIndustryForSub] = useState('');
  
  // Points state
  const [points, setPoints] = useState([]);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsError, setPointsError] = useState('');
  const [pointsSearch, setPointsSearch] = useState('');
  const [pointsIndustryFilter, setPointsIndustryFilter] = useState('');

  // Analytics state
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [topLimit, setTopLimit] = useState(10);
  const [activityMetrics, setActivityMetrics] = useState(null);
  const [pointsMetrics, setPointsMetrics] = useState(null);
  const [marksMetrics, setMarksMetrics] = useState(null);
  const [usersMetrics, setUsersMetrics] = useState(null);
  const [criteriaMetrics, setCriteriaMetrics] = useState(null);
  const [criteriaGrouped, setCriteriaGrouped] = useState([]);
  const [criteriaGrouping, setCriteriaGrouping] = useState(false);
  const [criteriaIndustryFilter, setCriteriaIndustryFilter] = useState('all');

  // Загрузка критериев
  const loadCriteria = async () => {
    try {
      setCriteriaLoading(true);
      setCriteriaError('');
      if (selectedIndustryForCriteria) {
        const data = await getCriteriaByIndustry(parseInt(selectedIndustryForCriteria));
        setCriteria(data);
      } else {
        setCriteria([]);
      }
    } catch (err) {
      setCriteriaError(err.message || 'Ошибка загрузки критериев');
    } finally {
      setCriteriaLoading(false);
    }
  };

  // Загрузка отраслей
  const loadIndustries = async () => {
    try {
      setIndustriesLoading(true);
      setIndustriesError('');
      const data = await getIndustries();
      setIndustries(data);
    } catch (err) {
      setIndustriesError(err.message || 'Ошибка загрузки отраслей');
    } finally {
      setIndustriesLoading(false);
    }
  };

  // Загрузка подотраслей
  const loadSubIndustries = async () => {
    try {
      setSubIndustriesLoading(true);
      setSubIndustriesError('');
      if (selectedIndustryForSub) {
        const data = await getSubIndustries(parseInt(selectedIndustryForSub));
        setSubIndustries(data);
      } else {
        setSubIndustries([]);
      }
    } catch (err) {
      setSubIndustriesError(err.message || 'Ошибка загрузки подотраслей');
    } finally {
      setSubIndustriesLoading(false);
    }
  };

  // Загрузка точек
  const loadPoints = async () => {
    try {
      setPointsLoading(true);
      setPointsError('');
      const data = await getAllPoints();
      setPoints(data);
    } catch (err) {
      setPointsError(err.message || 'Ошибка загрузки точек');
    } finally {
      setPointsLoading(false);
    }
  };

  // Загрузка аналитики
  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError('');
      const [activity, pointsM, marksM, usersM, criteriaM] = await Promise.all([
        getActivityMetrics(startDate, endDate, topLimit),
        getPointsMetrics(startDate, endDate, topLimit),
        getMarksMetrics(startDate, endDate, topLimit),
        getUsersMetrics(startDate, endDate, topLimit),
        getCriteriaMetrics(startDate, endDate, topLimit),
      ]);
      setActivityMetrics(activity);
      setPointsMetrics(pointsM);
      setMarksMetrics(marksM);
      setUsersMetrics(usersM);
      setCriteriaMetrics(criteriaM);

      // Группировка критериев по отраслям
      setCriteriaGrouping(true);
      try {
        const inds = await getIndustries();
        const criteriaMap = {};
        // Загружаем критерии по отраслям и строим карту criterion_id -> industry_name
        await Promise.all(
          inds.map(async (ind) => {
            const crits = await getCriteriaByIndustry(ind.id);
            crits.forEach((c) => {
              criteriaMap[c.id] = ind.name;
            });
          })
        );
        const grouped = {};
        (criteriaM?.criteria_avg || []).forEach((c) => {
          const industryName = criteriaMap[c.criteria_id] || 'Без отрасли';
          if (!grouped[industryName]) grouped[industryName] = [];
          grouped[industryName].push(c);
        });
        const groupedList = Object.entries(grouped).map(([industry, items]) => ({
          industry,
          items,
        }));
        setCriteriaGrouped(groupedList);
      } catch (groupErr) {
        console.error('Ошибка группировки критериев:', groupErr);
        setCriteriaGrouped([]);
      } finally {
        setCriteriaGrouping(false);
      }
    } catch (err) {
      setAnalyticsError(err.message || 'Ошибка загрузки аналитики');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Загружаем данные при смене таба
  useEffect(() => {
    if (activeTab === 'criteria') {
      loadIndustries(); // Загружаем отрасли для выбора
      if (selectedIndustryForCriteria) {
        loadCriteria();
      }
    } else if (activeTab === 'industries') {
      loadIndustries();
    } else if (activeTab === 'sub-industries') {
      loadIndustries(); // Загружаем отрасли для выбора
      if (selectedIndustryForSub) {
        loadSubIndustries();
      }
    } else if (activeTab === 'points') {
      loadPoints();
      loadIndustries();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, selectedIndustryForSub, selectedIndustryForCriteria]);

  // Создание критерия
  const handleCreateCriterion = async (e) => {
    e.preventDefault();
    if (!newCriterionText.trim() || !selectedIndustryForCriteria) {
      setCriteriaError('Выберите отрасль и введите текст критерия');
      return;
    }

    try {
      setCriteriaError('');
      await createCriterion({ 
        text: newCriterionText.trim(),
        industry_id: parseInt(selectedIndustryForCriteria)
      });
      setNewCriterionText('');
      await loadCriteria();
    } catch (err) {
      setCriteriaError(err.message || 'Ошибка создания критерия');
    }
  };

  // Удаление критерия
  const handleDeleteCriterion = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот критерий?')) {
      return;
    }

    try {
      setCriteriaError('');
      await deleteCriterion(id);
      await loadCriteria();
    } catch (err) {
      setCriteriaError(err.message || 'Ошибка удаления критерия');
    }
  };

  // Создание отрасли
  const handleCreateIndustry = async (e) => {
    e.preventDefault();
    if (!newIndustryName.trim()) {
      setIndustriesError('Введите название отрасли');
      return;
    }

    try {
      setIndustriesError('');
      await createIndustry({ name: newIndustryName.trim() });
      setNewIndustryName('');
      await loadIndustries();
    } catch (err) {
      setIndustriesError(err.message || 'Ошибка создания отрасли');
    }
  };

  // Удаление отрасли
  const handleDeleteIndustry = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту отрасль? Все подотрасли также будут удалены.')) {
      return;
    }

    try {
      setIndustriesError('');
      await deleteIndustry(id);
      await loadIndustries();
      if (activeTab === 'sub-industries') {
        setSelectedIndustryForSub('');
        setSubIndustries([]);
      }
    } catch (err) {
      setIndustriesError(err.message || 'Ошибка удаления отрасли');
    }
  };

  // Создание подотрасли
  const handleCreateSubIndustry = async (e) => {
    e.preventDefault();
    if (!newSubIndustryName.trim() || !selectedIndustryForSub) {
      setSubIndustriesError('Выберите отрасль и введите название подотрасли');
      return;
    }

    const parsedBaseScore = Number(newSubIndustryBaseScore);
    if (Number.isNaN(parsedBaseScore)) {
      setSubIndustriesError('Укажите вес (base_score) числом');
      return;
    }

    try {
      setSubIndustriesError('');
      await createSubIndustry({ 
        name: newSubIndustryName.trim(),
        industry_id: parseInt(selectedIndustryForSub),
        base_score: parsedBaseScore
      });
      setNewSubIndustryName('');
      setNewSubIndustryBaseScore('');
      await loadSubIndustries();
    } catch (err) {
      setSubIndustriesError(err.message || 'Ошибка создания подотрасли');
    }
  };

  // Удаление подотрасли
  const handleDeleteSubIndustry = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту подотрасль?')) {
      return;
    }

    try {
      setSubIndustriesError('');
      await deleteSubIndustry(id);
      await loadSubIndustries();
    } catch (err) {
      setSubIndustriesError(err.message || 'Ошибка удаления подотрасли');
    }
  };

  // Удаление точки
  const handleDeletePoint = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту точку?')) {
      return;
    }

    try {
      setPointsError('');
      await deletePoint(id);
      await loadPoints();
    } catch (err) {
      setPointsError(err.message || 'Ошибка удаления точки');
    }
  };

  const formatDateValue = (value) => {
    if (!value) return '';
    try {
      return new Date(value).toLocaleDateString('ru-RU');
    } catch {
      return value;
    }
  };

  const renderBarChart = (items = [], labelKey, valueKey, color = '#667eea', suffix = '', maxValueOverride = null) => {
    if (!items || items.length === 0) {
      return <p className="admin-empty" style={{ padding: '16px' }}>Нет данных</p>;
    }
    const values = items.map((i) => Number(i[valueKey]) || 0);
    const max = maxValueOverride !== null ? maxValueOverride : Math.max(...values, 1);
    return (
      <div className="bar-chart">
        {items.map((item, idx) => {
          const val = Number(item[valueKey]) || 0;
          const width = Math.max((val / max) * 100, 2);
          return (
            <div key={idx} className="bar-row">
              <span className="bar-label">{item[labelKey]}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${width}%`, background: color }} />
              </div>
              <span className="bar-value">
                {val}
                {suffix}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="admin-container">
      <div className="admin-content">
        {/* Заголовок */}
        <div className="admin-header">
          <h1>Админ-панель</h1>
          <button 
            onClick={() => navigate('/profile')} 
            className="admin-back-button"
          >
            ← Назад к профилю
          </button>
        </div>

        {/* Табы */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'criteria' ? 'active' : ''}`}
            onClick={() => setActiveTab('criteria')}
          >
            Критерии
          </button>
          <button 
            className={`admin-tab ${activeTab === 'industries' ? 'active' : ''}`}
            onClick={() => setActiveTab('industries')}
          >
            Отрасли
          </button>
          <button 
            className={`admin-tab ${activeTab === 'sub-industries' ? 'active' : ''}`}
            onClick={() => setActiveTab('sub-industries')}
          >
            Подотрасли
          </button>
          <button 
            className={`admin-tab ${activeTab === 'points' ? 'active' : ''}`}
            onClick={() => setActiveTab('points')}
          >
            Точки
          </button>
          <button 
            className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Аналитика
          </button>
        </div>

        {/* Контент табов */}
        <div className="admin-tab-content">
          {/* Критерии */}
          {activeTab === 'criteria' && (
            <div className="admin-section">
              <h2>Управление критериями</h2>
              
              {/* Выбор отрасли */}
              <div className="admin-form-group">
                <label>Выберите отрасль</label>
                <select
                  value={selectedIndustryForCriteria}
                  onChange={(e) => {
                    setSelectedIndustryForCriteria(e.target.value);
                    setCriteria([]);
                  }}
                  className="admin-select"
                >
                  <option value="">-- Выберите отрасль --</option>
                  {industries.map((industry) => (
                    <option key={industry.id} value={industry.id}>
                      {industry.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Форма создания */}
              {selectedIndustryForCriteria && (
                <form onSubmit={handleCreateCriterion} className="admin-form">
                  <div className="admin-form-group">
                    <label>Текст критерия</label>
                    <input
                      type="text"
                      value={newCriterionText}
                      onChange={(e) => setNewCriterionText(e.target.value)}
                      placeholder="Введите текст критерия"
                      required
                    />
                  </div>
                  <button type="submit" className="admin-button admin-button-primary">
                    Создать критерий
                  </button>
                </form>
              )}

              {criteriaError && (
                <div className="admin-error">{criteriaError}</div>
              )}

              {/* Список критериев */}
              <div className="admin-list">
                {criteriaLoading ? (
                  <p>Загрузка...</p>
                ) : !selectedIndustryForCriteria ? (
                  <p className="admin-empty">Выберите отрасль для просмотра критериев</p>
                ) : criteria.length === 0 ? (
                  <p className="admin-empty">Критерии не найдены</p>
                ) : (
                  criteria.map((criterion) => (
                    <div key={criterion.id} className="admin-list-item">
                      <span>{criterion.text || criterion.question || 'Без названия'}</span>
                      <button
                        onClick={() => handleDeleteCriterion(criterion.id)}
                        className="admin-button admin-button-danger"
                      >
                        Удалить
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Отрасли */}
          {activeTab === 'industries' && (
            <div className="admin-section">
              <h2>Управление отраслями</h2>
              
              {/* Форма создания */}
              <form onSubmit={handleCreateIndustry} className="admin-form">
                <div className="admin-form-group">
                  <label>Название отрасли</label>
                  <input
                    type="text"
                    value={newIndustryName}
                    onChange={(e) => setNewIndustryName(e.target.value)}
                    placeholder="Введите название отрасли"
                    required
                  />
                </div>
                <button type="submit" className="admin-button admin-button-primary">
                  Создать отрасль
                </button>
              </form>

              {industriesError && (
                <div className="admin-error">{industriesError}</div>
              )}

              {/* Список отраслей */}
              <div className="admin-list">
                {industriesLoading ? (
                  <p>Загрузка...</p>
                ) : industries.length === 0 ? (
                  <p className="admin-empty">Отрасли не найдены</p>
                ) : (
                  industries.map((industry) => (
                    <div key={industry.id} className="admin-list-item">
                      <span>{industry.name || 'Без названия'}</span>
                      <button
                        onClick={() => handleDeleteIndustry(industry.id)}
                        className="admin-button admin-button-danger"
                      >
                        Удалить
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Подотрасли */}
          {activeTab === 'sub-industries' && (
            <div className="admin-section">
              <h2>Управление подотраслями</h2>
              
              {/* Выбор отрасли */}
              <div className="admin-form-group">
                <label>Выберите отрасль</label>
                <select
                  value={selectedIndustryForSub}
                  onChange={(e) => {
                    setSelectedIndustryForSub(e.target.value);
                    setSubIndustries([]);
                  }}
                  className="admin-select"
                >
                  <option value="">-- Выберите отрасль --</option>
                  {industries.map((industry) => (
                    <option key={industry.id} value={industry.id}>
                      {industry.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Форма создания */}
              {selectedIndustryForSub && (
                <form onSubmit={handleCreateSubIndustry} className="admin-form">
                  <div className="admin-form-group">
                    <label>Название подотрасли</label>
                    <input
                      type="text"
                      value={newSubIndustryName}
                      onChange={(e) => setNewSubIndustryName(e.target.value)}
                      placeholder="Введите название подотрасли"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Вес (base_score)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newSubIndustryBaseScore}
                      onChange={(e) => setNewSubIndustryBaseScore(e.target.value)}
                      placeholder="Например, 1.0"
                      required
                    />
                  </div>
                  <button type="submit" className="admin-button admin-button-primary">
                    Создать подотрасль
                  </button>
                </form>
              )}

              {subIndustriesError && (
                <div className="admin-error">{subIndustriesError}</div>
              )}

              {/* Список подотраслей */}
              <div className="admin-list">
                {subIndustriesLoading ? (
                  <p>Загрузка...</p>
                ) : !selectedIndustryForSub ? (
                  <p className="admin-empty">Выберите отрасль для просмотра подотраслей</p>
                ) : subIndustries.length === 0 ? (
                  <p className="admin-empty">Подотрасли не найдены</p>
                ) : (
                  subIndustries.map((subIndustry) => (
                    <div key={subIndustry.id} className="admin-list-item">
                      <div className="admin-list-item-content">
                        <span className="admin-item-name">{subIndustry.name || 'Без названия'}</span>
                        <span className="admin-item-meta">
                          Вес: {subIndustry.base_score !== undefined ? subIndustry.base_score : '—'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteSubIndustry(subIndustry.id)}
                        className="admin-button admin-button-danger"
                      >
                        Удалить
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Точки */}
          {activeTab === 'points' && (
            <div className="admin-section">
              <h2>Управление точками</h2>

              {/* Фильтры */}
              <div className="admin-form" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 16 }}>
                <div className="admin-form-group">
                  <label>Поиск по названию</label>
                  <input
                    type="text"
                    value={pointsSearch}
                    onChange={(e) => setPointsSearch(e.target.value)}
                    placeholder="Введите название точки"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Фильтр по отрасли</label>
                  <select
                    className="admin-select"
                    value={pointsIndustryFilter}
                    onChange={(e) => setPointsIndustryFilter(e.target.value)}
                  >
                    <option value="">Все отрасли</option>
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.id}>
                        {ind.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {pointsError && (
                <div className="admin-error">{pointsError}</div>
              )}

              {/* Список точек */}
              <div className="admin-list">
                {pointsLoading ? (
                  <p>Загрузка...</p>
                ) : points.length === 0 ? (
                  <p className="admin-empty">Точки не найдены</p>
                ) : (
                  points
                    .filter((p) =>
                      pointsIndustryFilter
                        ? p.industry_id === Number(pointsIndustryFilter)
                        : true
                    )
                    .filter((p) =>
                      pointsSearch.trim()
                        ? (p.name || '').toLowerCase().includes(pointsSearch.trim().toLowerCase())
                        : true
                    )
                    .map((point) => (
                      <div key={point.id} className="admin-list-item">
                        <div className="admin-list-item-content">
                          <span className="admin-item-name">{point.name || 'Без названия'}</span>
                          <span className="admin-item-meta">
                            Координаты: {point.latitude?.toFixed(4)}, {point.longitude?.toFixed(4)}
                          </span>
                          {point.mark !== undefined && point.mark !== null && (
                            <span className="admin-item-meta">Оценка: {point.mark}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeletePoint(point.id)}
                          className="admin-button admin-button-danger"
                        >
                          Удалить
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Аналитика */}
          {activeTab === 'analytics' && (
            <div className="admin-section">
              <h2>Аналитика</h2>

              {/* Фильтры */}
              <form
                className="admin-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  loadAnalytics();
                }}
              >
                <div className="analytics-filters">
                  <div className="admin-form-group">
                    <label>Дата начала</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Дата окончания</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Top N</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={topLimit}
                      onChange={(e) => setTopLimit(Number(e.target.value) || 10)}
                    />
                  </div>
                  <div className="admin-form-group" style={{ alignSelf: 'flex-end' }}>
                    <button type="submit" className="admin-button admin-button-primary" disabled={analyticsLoading}>
                      {analyticsLoading ? 'Загрузка...' : 'Обновить'}
                    </button>
                  </div>
                </div>
              </form>

              {analyticsError && <div className="admin-error">{analyticsError}</div>}

              {analyticsLoading && <p>Загрузка аналитики...</p>}

              {!analyticsLoading && (
                <div className="analytics-grid">
                  {/* Точки */}
                  <div className="analytics-card">
                    <h3>Точки</h3>
                    <div className="analytics-charts">
                      <div>
                        <p className="chart-title">Точки по отраслям</p>
                        {renderBarChart(pointsMetrics?.points_by_industry?.map((i) => ({
                          label: i.industry,
                          value: i.count,
                        })), 'label', 'value', '#667eea')}
                      </div>
                      <div>
                        <p className="chart-title">Средняя оценка по отраслям</p>
                        {renderBarChart(
                          (pointsMetrics?.avg_rating_by_industry || []).map((i) => ({
                            label: i.industry,
                            value: Number(Number(i.avg_mark || 0).toFixed(2)),
                          })),
                          'label',
                          'value',
                          '#f6ad55',
                          '',
                          5
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Оценки */}
                  <div className="analytics-card">
                    <h3>Оценки</h3>
                    <div className="analytics-charts">
                      <div>
                        <p className="chart-title">Оценки по отраслям</p>
                        {renderBarChart(marksMetrics?.marks_by_industry?.map((i) => ({
                          label: i.industry,
                          value: i.count,
                        })), 'label', 'value', '#63b3ed')}
                      </div>
                    </div>
                    <div className="analytics-stats">
                      <div className="stat-card">
                        <p className="stat-label">Фото всего</p>
                        <p className="stat-value">{marksMetrics?.photos_total ?? 0}</p>
                      </div>
                      <div className="stat-card">
                        <p className="stat-label">Соотношение оценок к точкам</p>
                        <p className="stat-value">
                          {marksMetrics?.marks_to_points_ratio !== null && marksMetrics?.marks_to_points_ratio !== undefined
                            ? marksMetrics.marks_to_points_ratio.toFixed(2)
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Пользователи */}
                  <div className="analytics-card">
                    <h3>Пользователи</h3>
                    <div className="list-block">
                      {usersMetrics?.top_users?.length ? (
                        usersMetrics.top_users.map((u) => (
                          <div key={u.id} className="admin-list-item">
                            <span className="admin-item-name">{u.username || `ID ${u.id}`}</span>
                            <span className="admin-item-meta">Активность: {u.activity}</span>
                          </div>
                        ))
                      ) : (
                        <p className="admin-empty" style={{ padding: '12px' }}>Нет данных</p>
                      )}
                    </div>
                  </div>

                  {/* Критерии */}
                  <div className="analytics-card">
                    <div className="analytics-card-header">
                      <h3>Критерии (средние оценки)</h3>
                      {criteriaGrouped.length > 0 && (
                        <select
                          className="admin-select criteria-filter"
                          value={criteriaIndustryFilter}
                          onChange={(e) => setCriteriaIndustryFilter(e.target.value)}
                        >
                          <option value="all">Все отрасли</option>
                          {criteriaGrouped.map((group) => (
                            <option key={group.industry} value={group.industry}>
                              {group.industry}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    {criteriaGrouping ? (
                      <p>Группировка критериев...</p>
                    ) : criteriaGrouped.length === 0 ? (
                      renderBarChart(
                        criteriaMetrics?.criteria_avg?.map((c) => ({
                          label: c.text || `ID ${c.criteria_id}`,
                          value: Number(Number(c.avg || 0).toFixed(2)),
                        })),
                        'label',
                        'value',
                        '#9f7aea',
                        '',
                        5
                      )
                    ) : (
                      <div className="analytics-lists">
                        {criteriaGrouped
                          .filter((group) => criteriaIndustryFilter === 'all' || group.industry === criteriaIndustryFilter)
                          .map((group) => (
                          <div key={group.industry} className="list-block">
                            <p className="chart-title">{group.industry}</p>
                            {renderBarChart(
                              group.items.map((c) => ({
                                label: c.text || `ID ${c.criteria_id}`,
                                value: Number(Number(c.avg || 0).toFixed(2)),
                              })),
                              'label',
                              'value',
                              '#9f7aea',
                              '',
                              5
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

