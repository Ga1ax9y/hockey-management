import { useState, useEffect } from 'react';
import {
  getTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
  getTeams,
  getCurrentUserTeams,
  getCurrentUser,
  getTeamUsers,
} from '../../../services/api';
import './Trainings.css';
import { formatISOToDateInput } from '../../../utils/date';

export default function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    training_date: '',
    start_time: '',
    end_time: '',
    location: '',
    training_type: '',
    team_id: '',
    coach_id: '',
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [trainingsRes, teamsRes, userTeamsRes, userRes] = await Promise.all([
          getTrainings(),
          getTeams(),
          getCurrentUserTeams(),
          getCurrentUser(),
        ]);
        setTrainings(trainingsRes.data);
        setTeams(teamsRes.data);
        setUserTeams(userTeamsRes.data || []);
        setUser(userRes.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!user || !formData.team_id) {
      setCoaches([]);
      return;
    }

    const loadCoaches = async () => {
      try {
        const res = await getTeamUsers(formData.team_id);
        const teamCoaches = res.data.filter(u => u.role_id === 2);
        setCoaches(teamCoaches);

        if (!editingId && user.role_id === 2) {
          const isUserCoach = teamCoaches.some(c => c.id === user.id);
          if (isUserCoach) {
            setFormData(prev => {
              if (prev.team_id === formData.team_id) {
                return { ...prev, coach_id: user.id.toString() };
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.error('Ошибка загрузки тренеров', err);
        setCoaches([]);
      }
    };

    loadCoaches();
  }, [formData.team_id, user, editingId]);

  const resetForm = () => {
    setFormData({
      training_date: '',
      start_time: '',
      end_time: '',
      location: '',
      training_type: '',
      team_id: '',
      coach_id: '',
    });
    setEditingId(null);
    setIsCreating(false);
    setCoaches([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      team_id: Number(formData.team_id),
      coach_id: formData.coach_id ? Number(formData.coach_id) : null,
    };

    try {
      if (editingId) {
        await updateTraining(editingId, submitData);
      } else {
        await createTraining(submitData);
      }
      resetForm();
      const res = await getTrainings();
      setTrainings(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при сохранении');
    }
  };

  const handleEdit = (t) => {
    setFormData({
      training_date: t.training_date,
      start_time: t.start_time,
      end_time: t.end_time || '',
      location: t.location,
      training_type: t.training_type,
      team_id: t.team_id?.toString() || '',
      coach_id: t.coach_id?.toString() || '',
    });
    setEditingId(t.id);
    setIsCreating(true);

    if (t.team_id) {
      getTeamUsers(t.team_id).then(res => {
        const teamCoaches = res.data.filter(u => u.role_id === 2);
        setCoaches(teamCoaches);
      }).catch(console.error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить тренировку?')) return;
    try {
      await deleteTraining(id);
      const res = await getTrainings();
      setTrainings(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при удалении');
    }
  };

  const availableTeams = user?.role_id === 1 ? teams : userTeams;

  if (loading) return <div className="trainings-loading">Загрузка...</div>;
  if (error) return <div className="trainings-error">{error}</div>;

  return (
    <div className="trainings">
      <h1>Управление тренировками</h1>

      <button
        className="trainings-add-btn"
        onClick={() => {
          resetForm();
          setIsCreating(!isCreating);
        }}
      >
        {isCreating ? 'Отменить' : 'Добавить тренировку'}
      </button>

      {isCreating && (
        <form className="training-form" onSubmit={handleSubmit}>
          <div className="training-form-row">
            <input
              type="date"
              value={formData.training_date}
              onChange={(e) => setFormData({ ...formData, training_date: e.target.value })}
              required
            />
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
            />
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
          </div>

          <div className="training-form-row">
            <input
              type="text"
              placeholder="Место"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Тип тренировки"
              value={formData.training_type}
              onChange={(e) => setFormData({ ...formData, training_type: e.target.value })}
              required
            />
          </div>

          <div className="training-form-row">
            <select
              value={formData.team_id}
              onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
              required
            >
              <option value="">Выберите команду</option>
              {availableTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.team_name}
                </option>
              ))}
            </select>

            <select
              value={formData.coach_id}
              onChange={(e) => setFormData({ ...formData, coach_id: e.target.value })}
              disabled={!formData.team_id}
            >
              <option value="">Не выбран</option>
              {coaches.map(coach => (
                <option key={coach.id} value={coach.id}>
                  {coach.full_name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-submit">
            {editingId ? 'Сохранить' : 'Добавить'}
          </button>
        </form>
      )}

      <div className="trainings-list">
        {trainings.length === 0 ? (
          <p>Нет тренировок</p>
        ) : (
          trainings.map(t => (
            <div key={t.id} className="training-item">
              <div>
                <strong>{formatISOToDateInput(t.training_date)}</strong> — {t.team_name || '—'} — {t.coach_name || '—'}
              </div>
              <div>
                <button onClick={() => handleEdit(t)} className="btn-edit">Редактировать</button>
                <button onClick={() => handleDelete(t.id)} className="btn-delete">Удалить</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
