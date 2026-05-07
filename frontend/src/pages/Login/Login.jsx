import { useState } from "react";
import { loginUser } from '../../services/api';
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../hooks/useAuthStore";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUser(form);
      login(res.data.token);
      navigate("/");
    } catch (err) {
      setError(typeof err.response?.data === 'string'
        ? err.response.data
        : "Ошибка авторизации. Проверьте данные.");
    }
  };

  return (
    <div className="login-page container">
      <div className="login-page__wrapper">
        <header className="login-page__header">
          <h1 className="login-page__title">ВХОД В <span className="login-page__title-accent">СИСТЕМУ</span></h1>
          <p className="login-page__subtitle">Авторизуйтесь для управления командой</p>
        </header>

        <form className="login-page__form form-block" onSubmit={handleSubmit}>
          <div className="form-block__field">
            <label className="form-block__label">Электронная почта</label>
            <input
              className="form-block__input"
              name="email"
              type="email"
              placeholder="name@club.by"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-block__field">
            <label className="form-block__label">Пароль</label>
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

          {error && (
            <div className="login-page__error">
              <span className="login-page__error-icon">!</span>
              {error}
            </div>
          )}

          <button className="form-block__submit login-page__submit" type="submit">
            ПОДТВЕРДИТЬ ВХОД
          </button>

          <footer className="login-page__footer">
            <span>Нет аккаунта?</span>
            <Link to="/register" className="login-page__link">
              ЗАРЕГИСТРИРОВАТЬСЯ
            </Link>
          </footer>
        </form>
      </div>
    </div>
  );
}
