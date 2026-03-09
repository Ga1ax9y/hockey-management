import './Profile.css';
import { useAuthStore } from '../../hooks/useAuthStore';

export default function Profile() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <div className="profile-loading">Загрузка профиля...</div>;
  if (!user) return null;

  return (
    <div className="profile">
      <h1 className="profile__title">Мой профиль</h1>
      <div className="profile__card">
        <div className="profile__field">
          <strong>ФИО:</strong>
          <span>{user.fullName || '—'}</span>
        </div>
        <div className="profile__field">
          <strong>Email:</strong>
          <span>{user.email}</span>
        </div>
        <div className="profile__field">
          <strong>Роль:</strong>
          <span>{user.role.name}</span>
        </div>
        <div className="profile__field">
          <strong>Дата регистрации:</strong>
          <span>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
        </div>
      </div>
    </div>
  );
}
