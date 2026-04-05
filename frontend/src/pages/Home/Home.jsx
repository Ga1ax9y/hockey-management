import { useAuthStore } from '../../hooks/useAuthStore';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const user = useAuthStore(state => state.user)
  const isLoading = useAuthStore(state => state.isLoading)

  if (isLoading) return <div className="home-loading">Загрузка...</div>;
  if (!user) return null;

  return (
    <div className="home">
      <div className="home__welcome">
        <h1>Добро пожаловать, {user.fullName}!</h1>
        <p className="home__meta">
          <span className="home__role">Роль: {user.role.name}</span>
          <span className="home__email">Email: {user.email}</span>
        </p>
      </div>

      <div className="home__stats">
        <div className="stat-card">
          <h3>Ваши команды</h3>
          {user.teams?.length === 0 ? (
            <p className="home__no-teams">Вы не привязаны ни к одной команде.</p>
          ) : (
            <ul className="teams-list">
              {user.teams.map(ut => (
                <li key={ut.id}>
                  <Link to={`/teams/${ut.id}`} className="team-link">
                    {ut.name} <span className="team-league">({ut.league || '—'})</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

          <div className="stat-card">
            <h3>Быстрый доступ</h3>
            <ul className="quick-links">
              {user.role.code === "ADMIN"  && (
                <li><Link to="/admin">Панель управления</Link></li>
              )}
              {user.roleId === 2 && (
                <li><Link to="/coach/trainings">Тренировки</Link></li>
              )}
              {user.roleId === 3 && (
                <li><Link to="/admin/roles">Управление ролями</Link></li>
              )}
              {user.roleId === 7 && (
                <li><Link to="/manager/hierarchy">Иерархия команд</Link></li>
              )}
            </ul>
          </div>
      </div>

      <div className="home__footer">
        <p>Дата регистрации: {new Date(user.createdAt).toLocaleDateString('ru-RU')}</p>
      </div>
    </div>
  );
}
