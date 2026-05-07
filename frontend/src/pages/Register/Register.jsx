import { useState } from "react";
import { registerUser } from '../../services/api';
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    organizationName: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка регистрации");
    }
  };

  return (
    <div className="register-page container">
      <div className="register-page__wrapper">
        <header className="register-page__header">
          <h1 className="register-page__title">СОЗДАТЬ <span className="register-page__title-accent">АККАУНТ</span></h1>
          <p className="register-page__subtitle">Регистрация менеджера организации</p>
        </header>

        <form className="register-page__form form-block" onSubmit={handleSubmit}>
          <div className="form-block__field">
            <label className="form-block__label">ФИО полностью *</label>
            <input
              className="form-block__input"
              name="fullName"
              placeholder="Иванов Иван Иванович"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-block__row">
            <div className="form-block__field">
              <label className="form-block__label">Email *</label>
              <input
                className="form-block__input"
                name="email"
                type="email"
                placeholder="manager@club.by"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-block__field">
              <label className="form-block__label">Пароль *</label>
              <input
                className="form-block__input"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-block__field">
            <label className="form-block__label">Название организации *</label>
            <input
              className="form-block__input"
              name="organizationName"
              placeholder="Динамо"
              value={form.organizationName}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className="register-page__error">
              <span className="register-page__error-icon">!</span>
              {error}
            </div>
          )}

          <button className="form-block__submit register-page__submit" type="submit">
            ЗАРЕГИСТРИРОВАТЬСЯ
          </button>

          <footer className="register-page__footer">
            <span>Уже в системе?</span>
            <Link to="/login" className="register-page__link">
              ВОЙТИ В ПРОФИЛЬ
            </Link>
          </footer>
        </form>
      </div>
    </div>
  );
}
