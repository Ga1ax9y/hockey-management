import { useState, useEffect } from 'react';
import { getRoles } from '../../../services/api';
import { useAuthStore } from '../../../hooks/useAuthStore';
import './Roles.css';
import ErrorPage from '../../Error/ErrorPage';
import Loader from '../../../components/layout/Loader/Loader';


export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = useAuthStore(state => state.token);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles();
      setRoles(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data || 'Не удалось загрузить протоколы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadRoles();
  }, [token]);

  if (loading) return <Loader />;
  if (error) return <ErrorPage error={error} />;

  return (
    <div className="roles-screen container">
      <header className="roles-screen__header">
        <h2 className="roles-screen__title">Управление доступом</h2>
      </header>

      <div className="roles-screen__grid">
        {roles.length === 0 ? (
          <p className="roles-screen__empty">Конфигурации ролей не найдены</p>
        ) : (
          roles.map((role) => (
            <article key={role.id} className="role-card">
              <div className="role-card__side"></div>
              <div className="role-card__content">
                <div className="role-card__top">
                  <h3 className="role-card__name">{role.name}</h3>
                </div>

                <div className="role-card__description">
                  {role.description || "Описание полномочий не задано для данной роли."}
                </div>

                <div className="role-card__footer">
                  <div className="role-card__status">
                    <span className="role-card__dot"></span> Активна
                  </div>
                  <button className="role-card__action">Детали прав</button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {error && <div className="roles-screen__error">{error}</div>}
    </div>
  );
}
