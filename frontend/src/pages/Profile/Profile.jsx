import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../services/api';
import './Profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
      } catch (err) {
        setError('Не удалось загрузить профиль');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="profile-loading">Загрузка профиля...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!user) return null;

  return (
    <div className="profile">
      <h1 className="profile__title">Мой профиль</h1>
      <div className="profile__card">
        <div className="profile__field">
          <strong>ФИО:</strong>
          <span>{user.full_name || '—'}</span>
        </div>
        <div className="profile__field">
          <strong>Email:</strong>
          <span>{user.email}</span>
        </div>
        <div className="profile__field">
          <strong>Роль:</strong>
          <span>{user.role_name}</span>
        </div>
        <div className="profile__field">
          <strong>Аккаунт активен:</strong>
          <span>{user.is_active ? 'Да' : 'Нет'}</span>
        </div>
        <div className="profile__field">
          <strong>Дата регистрации:</strong>
          <span>{new Date(user.created_at).toLocaleDateString('ru-RU')}</span>
        </div>
      </div>
    </div>
  );
}
