import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './CouponsPage.css';

const CouponsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState(null);

  // Заглушки для купонов и промокодов
  const coupons = [
    {
      id: 1,
      title: 'Скидка 20% на фитнес',
      description: 'Скидка на абонемент в любой фитнес-клуб города',
      discount: '20%',
      icon: '💪',
      color: '#667eea',
      validUntil: '2025-12-31',
      code: 'FITNESS20',
      category: 'Спорт',
    },
    {
      id: 2,
      title: 'Бесплатная консультация',
      description: 'Консультация врача в поликлинике',
      discount: '100%',
      icon: '🏥',
      color: '#48bb78',
      validUntil: '2025-12-31',
      code: 'HEALTH100',
      category: 'Здоровье',
    },
    {
      id: 3,
      title: 'Скидка 15% на витамины',
      description: 'Скидка на покупку витаминов в аптеке',
      discount: '15%',
      icon: '💊',
      color: '#ed8936',
      validUntil: '2025-12-31',
      code: 'VITAMIN15',
      category: 'Здоровье',
    },
    {
      id: 4,
      title: 'Скидка 25% на массаж',
      description: 'Скидка на сеанс массажа',
      discount: '25%',
      icon: '💆',
      color: '#9f7aea',
      validUntil: '2025-12-31',
      code: 'MASSAGE25',
      category: 'Красота',
    },
    {
      id: 5,
      title: 'Скидка 30% на очки',
      description: 'Скидка на покупку очков в оптике',
      discount: '30%',
      icon: '👓',
      color: '#4299e1',
      validUntil: '2025-12-31',
      code: 'GLASSES30',
      category: 'Здоровье',
    },
    {
      id: 6,
      title: 'Скидка 10% на продукты',
      description: 'Скидка на здоровые продукты в супермаркете',
      discount: '10%',
      icon: '🛒',
      color: '#38b2ac',
      validUntil: '2025-12-31',
      code: 'FOOD10',
      category: 'Питание',
    },
  ];

  const promoCode = {
    code: 'CITYHEALTH2025',
    description: 'Универсальный промокод на все услуги',
    discount: '5%',
    validUntil: '2025-12-31',
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="coupons-container">
      <div className="coupons-content">
        {/* Заголовок */}
        <div className="coupons-header">
          <div className="coupons-header-content">
            <button 
              className="back-button"
              onClick={() => navigate('/profile')}
            >
              ← Назад к профилю
            </button>
            <div className="coupons-header-text">
              <h1>Бонусы и купоны</h1>
              <p className="coupons-subtitle">
                Используйте награды за вашу активность в городе
              </p>
            </div>
          </div>
        </div>

        {/* Промокод */}
        <div className="promo-code-section">
          <div className="promo-code-card">
            <div className="promo-code-header">
              <h2>🎁 Универсальный промокод</h2>
            </div>
            <div className="promo-code-content">
              <p className="promo-code-description">{promoCode.description}</p>
              <div className="promo-code-display">
                <span className="promo-code-text">{promoCode.code}</span>
                <button
                  className={`copy-button ${copiedCode === promoCode.code ? 'copied' : ''}`}
                  onClick={() => handleCopyCode(promoCode.code)}
                >
                  {copiedCode === promoCode.code ? '✓ Скопировано' : 'Копировать'}
                </button>
              </div>
              <div className="promo-code-info">
                <span className="promo-discount">Скидка: {promoCode.discount}</span>
                <span className="promo-valid">Действует до: {formatDate(promoCode.validUntil)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Купоны */}
        <div className="coupons-section">
          <h2 className="section-title">Ваши купоны</h2>
          <div className="coupons-grid">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="coupon-card">
                <div 
                  className="coupon-header"
                  style={{ background: `linear-gradient(135deg, ${coupon.color} 0%, ${coupon.color}dd 100%)` }}
                >
                  <div className="coupon-icon">{coupon.icon}</div>
                  <div className="coupon-discount">{coupon.discount}</div>
                </div>
                <div className="coupon-body">
                  <div className="coupon-category">{coupon.category}</div>
                  <h3 className="coupon-title">{coupon.title}</h3>
                  <p className="coupon-description">{coupon.description}</p>
                  <div className="coupon-code-section">
                    <div className="coupon-code-display">
                      <span className="coupon-code-text">{coupon.code}</span>
                      <button
                        className={`coupon-copy-button ${copiedCode === coupon.code ? 'copied' : ''}`}
                        onClick={() => handleCopyCode(coupon.code)}
                        title="Копировать код"
                      >
                        {copiedCode === coupon.code ? '✓' : '📋'}
                      </button>
                    </div>
                  </div>
                  <div className="coupon-footer">
                    <span className="coupon-valid">Действует до: {formatDate(coupon.validUntil)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Информация о наградах */}
        <div className="rewards-info">
          <h3>Как получить больше купонов?</h3>
          <div className="rewards-list">
            <div className="reward-item">
              <span className="reward-icon">⭐</span>
              <span>Получайте достижения за активность</span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">📈</span>
              <span>Повышайте уровень, зарабатывая опыт</span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">💬</span>
              <span>Оставляйте отзывы о местах</span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">📍</span>
              <span>Создавайте новые точки на карте</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponsPage;

