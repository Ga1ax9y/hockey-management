import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role_id: 2,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка регистрации");
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Регистрация</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          className="auth-input"
          name="full_name"
          placeholder="ФИО"
          value={form.full_name}
          onChange={handleChange}
        />
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
          Зарегистрироваться
        </button>
        {error && <p className="auth-error">{error}</p>}
      </form>
      <p className="auth-footer">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}
