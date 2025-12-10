import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTeamUsers,
  addTeamUser,
  removeTeamUser,
  getAllUsers,
} from '../services/api';
import './TeamMembers.css';
export default function TeamMembers() {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const [teamUsers, setTeamUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const [teamUsersRes, allUsersRes] = await Promise.all([
        getTeamUsers(teamId),
        getAllUsers(),
      ]);

      setTeamUsers(teamUsersRes.data);
      setAllUsers(allUsersRes.data.filter(user =>
        !teamUsersRes.data.some(tu => tu.id === user.id)
      ));
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
      <h2>Управление составом команды</h2>
      <button
        className="members-back-btn"
        onClick={() => navigate(`/teams/${teamId}`)}
      >
        ← Назад к команде
      </button>

      <div className="members-section">
        <h3>Текущие участники</h3>
        {teamUsers.length === 0 ? (
          <p>Нет привязанных пользователей</p>
        ) : (
          <ul className="members-list">
            {teamUsers.map(user => (
              <li key={user.id} className="member-item">
                <div className="member-info">
                  <strong>{user.full_name}</strong>
                  <span className="member-role">{user.role_name}</span>
                  <span className="member-email">{user.email}</span>
                </div>
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="btn-remove"
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="members-section">
        <h3>Добавить пользователя в команду</h3>
        {allUsers.length === 0 ? (
          <p>Нет доступных пользователей для добавления</p>
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
                  {user.full_name} ({user.email}) — {user.role_name}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-add">Добавить</button>
          </form>
        )}
      </div>
    </div>
  );
}
