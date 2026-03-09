import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  addTeamUser,
  removeTeamUser,
  getAllUsers,
  getTeamById
} from '../../services/api';
import './TeamMembers.css';
import { useRole } from '../../hooks/useRole';

export default function TeamMembers() {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const [teamUsers, setTeamUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const {isAdmin, isManager} = useRole()


  const loadTeamData = async () => {
    try {
      setLoading(true);
      const playersRes = await getTeamById(teamId, {includePlayers: true, includeUsers: true});
      const allUsersRes = await getAllUsers()
      const teamUsersRes = playersRes.data.users.map(ut => ut?.user)
      setPlayers(playersRes.data.players);
      setTeamUsers(teamUsersRes);
      setAllUsers(allUsersRes.data.filter(
                    user =>!teamUsersRes.some(ut => ut.id === user.id)));
      setError('');
    } catch (err) {
      setTeamUsers([]);
      setPlayers([]);
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
                  <strong>{user.fullName}</strong>
                  <span className="member-role">{user.role.name}</span>
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
      {(isAdmin || isManager) && (
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
                    {user.fullName} ({user.role.name})
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
                    {player.lastName} {player.firstName}
                    {player.middleName && ` ${player.middleName}`}
                  </Link>
                </div>
                <div className="player-details">
                  <div>Позиция: <strong>{player.position || '—'}</strong></div>
                  <div>Рост: <strong>{player.height || '—'} см</strong></div>
                  <div>Вес: <strong>{player.weight || '—'} кг</strong></div>
                  <div>Контракт до: <strong>{player.contractExpiry ? new Date(player.contractExpiry).toLocaleDateString('ru-RU') : '—'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
