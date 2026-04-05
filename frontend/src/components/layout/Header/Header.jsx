import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../hooks/useAuthStore';
import './Header.css';
import { useRole } from '../../../hooks/useRole';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuthStore()
  const isAuthenticated = useAuthStore((state) => state.token !== null);
  const {isAdmin, isCoach, isManager} = useRole()
  const navigate = useNavigate();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);


  const handleLogout = () => {
    logout()
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
        <ul>
          <li>
            <Link to="/">Главная</Link>
          </li>
          {!isAuthenticated && <li>
            <Link to="/login">Войти</Link>
          </li> }
           {isAdmin && <li>
            <Link to="/admin">Управление</Link>
          </li>}
          {(isManager || isAdmin) && <li>
            <Link to="/manager/hierarchy">Иерархия</Link>
          </li>}
          {(isCoach || isAdmin) && <li>
            <Link to="/events">События</Link>
          </li>}
          {isAuthenticated && (
            <>
              <li>
                <Link to="/profile">Профиль</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="header__logout-button">
                  Выйти
                </button>
              </li>
            </>
          )}
        </ul>

      </nav>

      <nav className={`header__nav-mobile ${isMenuOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <Link to="/" onClick={toggleMenu}>Главная</Link>
          </li>
          {!isAuthenticated && <li>
            <Link to="/login" onClick={toggleMenu}>Войти</Link>
          </li> }
           {isAdmin && <li>
            <Link to="/admin" onClick={toggleMenu}>Управление</Link>
          </li>}
          {(isManager || isAdmin) && <li>
            <Link to="/manager/hierarchy" onClick={toggleMenu}>Иерархия</Link>
          </li>}
          {(isCoach || isAdmin) && <li>
            <Link to="/events" onClick={toggleMenu}>Тренировки</Link>
          </li>}
          {isAuthenticated && (
            <>
              <li>
                <Link to="/profile" onClick={toggleMenu}>Профиль</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="header__logout-button mobile">
                  Выйти
                </button>
              </li>
            </>
          )}
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
