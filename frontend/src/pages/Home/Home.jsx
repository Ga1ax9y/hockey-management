import { useState, useEffect } from 'react';
import { useAuthStore } from '../../hooks/useAuthStore';
import { getCurrentUser, getCurrentUserTeams } from '../../services/api';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const { token } = useAuthStore();
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [userRes, teamsRes] = await Promise.all([
          getCurrentUser(),
          getCurrentUserTeams()
        ]);

        setUser(userRes.data);
        setTeams(teamsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Ошибка загрузки данных');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  if (loading) return <div className="home-loading">Загрузка...</div>;
  if (error) return <div className="home-error">{error}</div>;
  if (!user) return null;

  return (
    <div className="home">
      <div className="home__welcome">
        <h1>Добро пожаловать, {user.full_name}!</h1>
        <p className="home__meta">
          <span className="home__role">Роль: {user.description}</span>
          <span className="home__email">Email: {user.email}</span>
        </p>
      </div>

      <div className="home__stats">
        <div className="stat-card">
          <h3>Ваши команды</h3>
          {teams.length === 0 ? (
            <p className="home__no-teams">Вы не привязаны ни к одной команде.</p>
          ) : (
            <ul className="teams-list">
              {teams.map(team => (
                <li key={team.id}>
                  <Link to={`/teams/${team.id}`} className="team-link">
                    {team.team_name} <span className="team-league">({team.league || '—'})</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

          <div className="stat-card">
            <h3>Быстрый доступ</h3>
            <ul className="quick-links">
              {user.role_id === 1 && (
                <li><Link to="/admin/roles">Управление ролями</Link></li>
              )}
              {user.role_id === 2 && (
                <li><Link to="/coach/schedule">Тренировки</Link></li>
              )}
              {user.role_id === 1 && (
                <li><Link to="/admin/roles">Управление ролями</Link></li>
              )}
              {user.role_id === 7 && (
                <li><Link to="/manager/hierarchy">Иерархия команд</Link></li>
              )}
              <li><Link to="/manager/players">Управление игроками</Link></li>
            </ul>
          </div>
      </div>

      <div className="home__footer">
        <p>Дата регистрации: {new Date(user.created_at).toLocaleDateString('ru-RU')}</p>
        <p>Аккаунт {user.is_active ? 'активен' : 'неактивен'}</p>
      </div>
    </div>
  );
}
