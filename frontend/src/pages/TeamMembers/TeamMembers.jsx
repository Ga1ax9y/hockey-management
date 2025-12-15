import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getTeamUsers,
  addTeamUser,
  removeTeamUser,
  getAllUsers,
  getPlayers,
  getRoles
} from '../../services/api';
import './TeamMembers.css';
import { useAuthStore } from '../../hooks/useAuthStore';

export default function TeamMembers() {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const [teamUsers, setTeamUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const { role } = useAuthStore();
  const isAdmin = role === 1;
  const isManager = role === 7;

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role.description;
  };
  const loadTeamData = async () => {
    try {
      setLoading(true);
      const playersRes = await getPlayers(teamId);
      const [teamUsersRes, allUsersRes, rolesRes] = await Promise.all([
        getTeamUsers(teamId),
        getAllUsers(),
        getRoles(),
      ]);

      setPlayers(playersRes.data);
      setTeamUsers(teamUsersRes.data);
      setAllUsers(allUsersRes.data.filter(user =>
        !teamUsersRes.data.some(tu => tu.id === user.id)
      ));
      setRoles(rolesRes.data);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить данные');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const handleAddUser = async () => {
    if (!selectedUserId) return;
    try {
      await addTeamUser(teamId, selectedUserId);
      loadTeamData();
      setSelectedUserId('');
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось привязать пользователя');
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!confirm('Отвязать пользователя от команды?')) return;
    try {
      await removeTeamUser(teamId, userId);
      loadTeamData();
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось отвязать пользователя');
    }
  };

  if (loading) return <div className="members-loading">Загрузка...</div>;
  if (error) return <div className="members-error">{error}</div>;

  return (
    <div className="team-members">
      <h2>Состав и персонал команды</h2>
      <button
        className="members-back-btn"
        onClick={() => navigate(`/teams/${teamId}`)}
      >
        ← Назад к команде
      </button>

      <div className="members-section staff-section">
        <h3>Персонал команды</h3>
        {teamUsers.length === 0 ? (
          <p className="empty-message">Нет привязанного персонала</p>
        ) : (
          <ul className="members-list">
            {teamUsers.map(user => (
              <li key={user.id} className="member-item">
                <div className="member-info">
                  <strong>{user.full_name}</strong>
                  <span className="member-role">{getRoleName(user.role_id)}</span>
                  <span className="member-email">{user.email}</span>
                </div>
                {(isAdmin || isManager) && (
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="btn-remove"
                  >
                    Отвязать
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {isAdmin || isManager && (
        <div className="members-section add-staff-section">
          <h3>Добавить персонал</h3>
          {allUsers.length === 0 ? (
            <p className="empty-message">Нет доступных пользователей</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }} className="add-member-form">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
              >
                <option value="">Выберите пользователя...</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({getRoleName(user.role_id)})
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-add">Добавить</button>
            </form>
          )}
        </div>
      )}
      <div className="members-section players-section">
        <h3>Игроки команды</h3>
        {players.length === 0 ? (
          <p className="empty-message">Нет игроков в команде</p>
        ) : (
          <div className="players-grid">
            {players.map(player => (
              <div key={player.id} className="player-card">
                <div className="player-name">
                  <Link to={`/players/${player.id}`}>
                    {player.last_name} {player.first_name}
                    {player.middle_name && ` ${player.middle_name}`}
                  </Link>
                </div>
                <div className="player-details">
                  <div>Позиция: <strong>{player.position || '—'}</strong></div>
                  <div>Рост: <strong>{player.height || '—'} см</strong></div>
                  <div>Вес: <strong>{player.weight || '—'} кг</strong></div>
                  <div>Контракт до: <strong>{player.contract_expiry ? new Date(player.contract_expiry).toLocaleDateString('ru-RU') : '—'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
