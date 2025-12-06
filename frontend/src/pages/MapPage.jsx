import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MapComponent from '../components/Map/MapComponent';
import './MapPage.css';

const API_BASE_URL = 'http://localhost:8000';

const MapPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const getAvatarUrl = () => {
    const url = user?.avatar_url;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className="map-page">
      <button 
        className="map-profile-button"
        onClick={handleProfileClick}
        title="Перейти в профиль"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="map-profile-avatar"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <span className="map-profile-icon" style={{ display: avatarUrl ? 'none' : 'flex' }}>👤</span>
        <span className="map-profile-name">{user?.name || user?.username || 'Профиль'}</span>
      </button>
      <MapComponent />
    </div>
  );
};

export default MapPage;

