import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Добро пожаловать в CityHealth!</h1>
        {user && (
          <div className="user-info">
            <p>Вы вошли как: <strong>{user.name || user.username || user.email}</strong></p>
            <p className="user-email">{user.email}</p>
          </div>
        )}
        <button onClick={handleLogout} className="logout-button">
          Выйти
        </button>
      </div>
    </div>
  );
};

export default HomePage;

