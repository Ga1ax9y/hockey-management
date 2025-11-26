import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
        <Link to="/login">Войти</Link>
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
