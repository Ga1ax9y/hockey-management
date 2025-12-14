import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../hooks/useAuthStore';
import './Header.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { role, logout } = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.token !== null);
  const navigate = useNavigate();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const isAdmin = role === 1;
  const isManager = role === 7;
  const isCoach = role === 2;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="header">
      <div className="header__logo">
        <Link to="/" onClick={() => setIsMenuOpen(false)}>
          Hockey<span>Management</span>
        </Link>
      </div>

      <button
        className={`header__burger ${isMenuOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className="header__nav-desktop">
        <Link to="/">Главная</Link>
        {!isAuthenticated && <Link to="/login">Войти</Link>}
        {isAdmin && <Link to="/admin">Управление</Link>}
        {(isManager || isAdmin) && <Link to="/manager/hierarchy">Иерархия</Link>}
        {(isCoach || isAdmin) && <Link to="/coach/trainings">Тренировки</Link>}
        {isAuthenticated && (
          <>
            <Link to="/profile">Профиль</Link>
            <button onClick={handleLogout} className="header__logout-button">
              Выйти
            </button>
          </>
        )}
      </nav>

      <nav className={`header__nav-mobile ${isMenuOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Главная</Link>
          </li>
          <li>
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>Войти</Link>
          </li>
        </ul>
      </nav>

      {isMenuOpen && (
        <div
          className="header__overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
}
