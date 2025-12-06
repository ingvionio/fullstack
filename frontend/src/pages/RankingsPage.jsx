import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsersEngagement, getUsersList } from '../services/adminService';
import './RankingsPage.css';

const METRIC_OPTIONS = [
  { value: 'engagement', label: 'Вовлеченность (engagement)' },
  { value: 'points_count', label: 'Точки' },
  { value: 'marks_count', label: 'Оценки' },
  { value: 'photos_count', label: 'Фото' },
  { value: 'streak_current_weeks', label: 'Текущий стрик (недели)' },
  { value: 'streak_best_weeks', label: 'Лучший стрик (недели)' },
  { value: 'level', label: 'Уровень' },
];

const PERIOD_OPTIONS = [
  { value: 'all', label: 'За всё время' },
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'year', label: 'Год' },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

const getStartDateByPeriod = (period) => {
  const today = new Date();
  const map = {
    day: 1,
    week: 7,
    month: 30,
    year: 365,
  };
  const days = map[period];
  if (!days) return '';
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));
  return start.toISOString().slice(0, 10);
};

const RankingsPage = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [topLimit, setTopLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [metric, setMetric] = useState('engagement');
  const [period, setPeriod] = useState('all');

  // Автоматически устанавливаем даты по выбранному периоду
  useEffect(() => {
    if (period === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }
    setEndDate(todayISO());
    setStartDate(getStartDateByPeriod(period));
  }, [period]);

  const sortedUsers = useMemo(() => {
    const arr = [...users];
    arr.sort((a, b) => {
      const av = Number(a[metric]) || 0;
      const bv = Number(b[metric]) || 0;
      return bv - av;
    });
    return arr;
  }, [users, metric]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [engagement, usersList] = await Promise.all([
        getUsersEngagement(startDate, endDate, topLimit),
        getUsersList(),
      ]);
      const usersMap = {};
      (usersList || []).forEach((u) => {
        usersMap[u.id] = u;
      });
      const merged = (engagement || []).map((u) => ({
        ...u,
        level: usersMap[u.user_id]?.level ?? null,
      }));
      setUsers(merged);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки рейтинга');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rankings-container">
      <div className="rankings-content">
        <div className="rankings-header">
          <button className="rankings-back" onClick={() => navigate('/profile')}>
            ← Назад в профиль
          </button>
          <div>
            <h1>Рейтинг пользователей</h1>
            <p className="rankings-subtitle">Топ по вовлеченности (engagement)</p>
          </div>
        </div>

        <form
          className="rankings-filters"
          onSubmit={(e) => {
            e.preventDefault();
            loadData();
          }}
        >
          <div className="filter-group">
            <label>Дата начала</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Дата окончания</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Период</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Top N</label>
            <input
              type="number"
              min="1"
              max="100"
              value={topLimit}
              onChange={(e) => setTopLimit(Number(e.target.value) || 20)}
            />
          </div>
          <div className="filter-group">
            <label>Параметр</label>
            <select value={metric} onChange={(e) => setMetric(e.target.value)}>
              {METRIC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-actions">
            <button type="submit" className="filter-button" disabled={loading}>
              {loading ? 'Загрузка...' : 'Обновить'}
            </button>
          </div>
        </form>

        {error && <div className="rankings-error">{error}</div>}

        <div className="rankings-table-wrapper">
          <table className="rankings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Пользователь</th>
                <th>Engagement</th>
                <th>Точки</th>
                <th>Оценки</th>
                <th>Фото</th>
                <th>Текущий стрик (нед)</th>
                <th>Лучший стрик (нед)</th>
                <th>Уровень</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center' }}>
                    Загрузка...
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center' }}>
                    Данных нет
                  </td>
                </tr>
              ) : (
                sortedUsers.map((u, idx) => (
                  <tr key={u.user_id || idx}>
                    <td>{idx + 1}</td>
                    <td>{u.username || `ID ${u.user_id}`}</td>
                    <td>{Math.round(u.engagement * 100) / 100}</td>
                    <td>{u.points_count ?? 0}</td>
                    <td>{u.marks_count ?? 0}</td>
                    <td>{u.photos_count ?? 0}</td>
                    <td>{u.streak_current_weeks ?? 0}</td>
                    <td>{u.streak_best_weeks ?? 0}</td>
                    <td>{u.level ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RankingsPage;

