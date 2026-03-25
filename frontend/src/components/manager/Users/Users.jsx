import { useCallback, useEffect, useState } from "react";
import { getRoles, createUser } from "../../../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Users.css";
export default function Users() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
        fullName: "",
        roleId: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const generatePassword = (length = 12) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };
    useEffect(() => {
        setForm(prev => ({ ...prev, password: generatePassword() }));
    }, []);
    const loadRoles = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getRoles();
            setRoles(res.data);
            setError('');
        } catch (err) {
            setError('Не удалось загрузить роли');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRoles();
    }, [loadRoles]);
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleRegeneratePassword = () => {
        setIsGenerating(true);
        setForm({ ...form, password: generatePassword() });
        setTimeout(() => setIsGenerating(false), 500);
    };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(form);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка регистрации");
    }
  };
  if (loading) return <div>Загрузка ролей...</div>;

  return (
    <div className="auth-container">
      <h1 className="auth-title">Создание личного аккаунта пользователя</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          className="auth-input"
          name="fullName"
          placeholder="ФИО"
          value={form.fullName}
          onChange={handleChange}
        />
        <input
          className="auth-input"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
    <div className="password-field">
        <div className="password-wrapper">
            <input
                className="auth-input"
                type="text"
                name="password"
                value={form.password}
                onChange={handleChange}
            />
            <button
                type="button"
                onClick={handleRegeneratePassword}
                className={`regenerate-btn ${isGenerating ? 'spinning' : ''}`}
                title="Сгенерировать новый пароль"
                disabled={isGenerating}
            >

            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none">
            <path d="M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.61061 20 7.46589 18.9525 6 17.2916M9 17H6V17.2916M18.2002 4V6.94416M18.2002 6.94416V6.99993L15.2002 7M6 20V17.2916" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            </button>
        </div>
    </div>
        <select
            className="auth-input"
            value={form.roleId || ''}
            name="roleId"
            onChange={handleChange}
        >
        <option value="">Роль</option>
            {roles.map(role => (
                <option key={role.id} value={role.id}>
                    {role.name} (ID: {role.id})
                </option>
            ))}
        </select>
        <button className="auth-button" type="submit">
          Создать аккаунт
        </button>
        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
}
