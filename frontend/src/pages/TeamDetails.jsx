import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeamById, updateTeam, deleteTeam } from '../services/api';
import './TeamDetails.css';

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    team_name: '',
    league: '',
    level: 1,
    season: '',
  });

  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await getTeamById(id);
      setTeam(res.data);
      setEditForm(res.data);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить команду');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateTeam(id, editForm);
      setTeam(editForm);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при обновлении команды');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту команду? Это действие нельзя отменить.')) return;
    try {
      await deleteTeam(id);
      navigate('/manager/hierarchy', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при удалении команды');
    }
  };

  if (loading) return <div className="team-detail-loading">Загрузка...</div>;
  if (error) return <div className="team-detail-error">{error}</div>;
  if (!team) return null;

  return (
    <div className="team-detail">
      <h2>Команда: {team.team_name}</h2>

      {isEditing ? (
        <form className="team-edit-form" onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Название команды *</label>
            <input
              type="text"
              value={editForm.team_name}
              onChange={(e) => setEditForm({ ...editForm, team_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Лига</label>
            <input
              type="text"
              value={editForm.league || ''}
              onChange={(e) => setEditForm({ ...editForm, league: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Уровень *</label>
            <input
              type="number"
              min="1"
              max="10"
              value={editForm.level}
              onChange={(e) => setEditForm({ ...editForm, level: Number(e.target.value) })}
              required
            />
          </div>
          <div className="form-group">
            <label>Сезон *</label>
            <input
              type="text"
              value={editForm.season}
              onChange={(e) => setEditForm({ ...editForm, season: e.target.value })}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Сохранить</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <div className="team-info">
          <p><strong>ID:</strong> {team.id}</p>
          <p><strong>Название:</strong> {team.team_name}</p>
          <p><strong>Лига:</strong> {team.league || '—'}</p>
          <p><strong>Уровень:</strong> {team.level}</p>
          <p><strong>Сезон:</strong> {team.season}</p>
        </div>
      )}

      {!isEditing && (
        <div className="team-actions">
          <button onClick={() => setIsEditing(true)} className="btn-primary">
            Редактировать
          </button>
          <button onClick={handleDelete} className="btn-danger">
            Удалить команду
          </button>
          <button onClick={() => navigate(`/teams/${id}/members`)} className="btn-primary">
            Штаб
          </button>
          <button onClick={() => navigate('/manager/hierarchy')} className="btn-secondary">
            Назад к иерархии
          </button>
        </div>
      )}
    </div>
  );
}
