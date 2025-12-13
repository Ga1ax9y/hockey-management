import { useState } from "react";
import { loginUser } from '../../services/api';
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../hooks/useAuthStore";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);

      login(res.data.token);

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка входа");
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Вход</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          className="auth-input"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          className="auth-input"
          type="password"
          name="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
        />
        <button className="auth-button" type="submit">
          Войти
        </button>
        {error && <p className="auth-error">{error}</p>}
      </form>
      <p className="auth-footer">
        У вас нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  );
}
