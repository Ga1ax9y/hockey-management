import { useState, useEffect } from 'react';
import { getRoles } from '../../../services/api';
import { useAuthStore } from '../../../hooks/useAuthStore';
import './Roles.css'
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
      setError('Не удалось загрузить роли');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadRoles();
    }
  }, [token]);


  if (loading) return <div>Загрузка ролей...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-roles">
      <h2>Обзор ролей</h2>

      <div className="roles-list">
        <h3>Существующие роли</h3>
        {roles.length === 0 ? (
          <p>Нет ролей</p>
        ) : (
          <ul>
            {roles.map((role) => (
              <li key={role.id} className="role-item">
                <div className="role-display">
                    <div className="role-info">
                        <strong>{role.name}</strong>
                        {role.description && <span> — {role.description}</span>}
                    </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
