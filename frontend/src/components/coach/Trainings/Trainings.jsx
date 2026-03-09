import { useState, useEffect, useCallback } from 'react';
import {
  getTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
  getTeams,
  getTeamById,
} from '../../../services/api';
import './Trainings.css';
import { useRole } from '../../../hooks/useRole';
import { useAuthStore } from '../../../hooks/useAuthStore';
import { formatDateTimeToRU, toInputDateTime, inputDateTimeToISO } from '../../../utils/date';

const TRAINING_TYPES = [
  { value: '', label: 'Выберите тип' },
  { value: 'ice', label: 'Лед' },
  { value: 'gym', label: 'Тренажерный зал' },
  { value: 'theory', label: 'Теория' },
  { value: 'recovery', label: 'Восстановление' },
  { value: 'game', label: 'Игровая' },
];

export default function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    location: '',
    trainingType: '',
    teamId: '',
    coachId: '',
  });

  const { isCoach, isAdmin, isManager } = useRole();
  const user = useAuthStore(state => state.user);
  const canManage = isCoach || isAdmin || isManager;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [trainingsRes, teamsRes] = await Promise.all([
          getTrainings(),
          getTeams(),
        ]);

        const trainingsData = trainingsRes.data?.data || trainingsRes.data || [];
        const teamsData = teamsRes.data?.data || teamsRes.data || [];

        setTrainings(trainingsData);
        setTeams(teamsData);
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

  const loadCoaches = useCallback(async (teamId) => {
    if (!teamId) {
      setCoaches([]);
      return;
    }

    try {
      const res = await getTeamById(teamId, { includeUsers: true });
      const teamData = res.data?.data || res.data || {};

      const teamUsers = teamData.userTeams?.map(ut => ut.user).filter(Boolean) || [];

      const teamCoaches = teamUsers.filter(u => u.role?.code === 'COACH');

      setCoaches(teamCoaches);
    } catch (err) {
      console.error('Ошибка загрузки тренеров:', err);
      setCoaches([]);
    }
  }, []);

  useEffect(() => {
    if (editingId) return;

    const teamId = formData.teamId;
    if (!teamId) {
      setCoaches([]);
      return;
    }

    loadCoaches(teamId);

    if (isCoach) {
      setFormData(prev => ({
        ...prev,
        coachId: user?.id?.toString() || ''
      }));
    }
  }, [formData.teamId, loadCoaches, isCoach, user, editingId]);

  const resetForm = () => {
    setFormData({
      startTime: '',
      endTime: '',
      location: '',
      trainingType: '',
      teamId: '',
      coachId: '',
    });
    setEditingId(null);
    setIsCreating(false);
    setCoaches([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      startTime:  inputDateTimeToISO(formData.startTime),
      endTime:  inputDateTimeToISO(formData.endTime),
      location: formData.location,
      trainingType: formData.trainingType,
      teamId: Number(formData.teamId),
      coachId: formData.coachId ? Number(formData.coachId) : null,
    };

    try {
      if (editingId) {
        await updateTraining(editingId, submitData);
      } else {
        await createTraining(submitData);
      }

      resetForm();

      const res = await getTrainings();
      setTrainings(res.data?.data || res.data || []);

    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Ошибка при сохранении');
    }
  };

  const handleEdit = async (t) => {
    setEditingId(t.id);

    setFormData({
      startTime: toInputDateTime(t.startTime),
      endTime: toInputDateTime(t.endTime),
      location: t.location || '',
      trainingType: t.trainingType || '',
      teamId: t.teamId?.toString() || '',
      coachId: t.coachId?.toString() || '',
    });

    setIsCreating(true);

    if (t.teamId) {
      await loadCoaches(t.teamId.toString());
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить тренировку?')) return;

    try {
      await deleteTraining(id);
      const res = await getTrainings();
      setTrainings(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Ошибка при удалении');
    }
  };

  const availableTeams = canManage
    ? teams
    : (user?.userTeams?.map(ut => ut.team) || []);

  const formatTrainingDisplay = (t) => {
    const teamName = t.team?.name || teams.find(tm => tm.id === t.teamId)?.name || '—';
    const coachName = t.coach?.fullName || coaches.find(c => c.id === t.coachId)?.fullName || '—';
    const typeLabel = TRAINING_TYPES.find(tt => tt.value === t.trainingType)?.label || t.trainingType;

    return { teamName, coachName, typeLabel };
  };

  if (loading) return <div className="trainings-loading">Загрузка...</div>;
  if (error) return <div className="trainings-error">{error}</div>;

  return (
    <div className="trainings">
      <h1>Управление тренировками</h1>

      {canManage && (
        <button
          className="trainings-add-btn"
          onClick={() => {
            if (isCreating) {
              resetForm();
            } else {
              setIsCreating(true);
            }
          }}
        >
          {isCreating ? 'Отменить' : 'Добавить тренировку'}
        </button>
      )}

      {isCreating && canManage && (
        <form className="training-form" onSubmit={handleSubmit}>
          <div className="training-form-row">
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              placeholder="Время окончания"
            />
          </div>

          <div className="training-form-row">
            <input
              type="text"
              placeholder="Место проведения"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <select
              value={formData.trainingType}
              onChange={(e) => setFormData({ ...formData, trainingType: e.target.value })}
              required
            >
              {TRAINING_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="training-form-row">
            <select
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value, coachId: '' })}
              required
            >
              <option value="">Выберите команду</option>
              {availableTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <select
              value={formData.coachId}
              onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
              disabled={!formData.teamId || coaches.length === 0}
            >
              <option value="">
                {coaches.length === 0 ? 'Нет доступных тренеров' : 'Выберите тренера'}
              </option>
              {coaches.map(coach => (
                <option key={coach.id} value={coach.id}>
                  {coach.fullName}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-submit">
            {editingId ? 'Сохранить изменения' : 'Создать тренировку'}
          </button>
        </form>
      )}

      <div className="trainings-list">
        {trainings.length === 0 ? (
          <p className="empty-message">Нет запланированных тренировок</p>
        ) : (
          trainings.map(t => {
            const { teamName, coachName, typeLabel } = formatTrainingDisplay(t);

            return (
              <div key={t.id} className="training-item">
                <div className="training-info">
                  <div className="training-main">
                    <strong>{teamName} </strong>
                    <span className="training-type">{typeLabel}</span>
                  </div>
                  <div className="training-details">
                    {formatDateTimeToRU(t.startTime)} — {formatDateTimeToRU(t.endTime)} | Локация: {t.location} | Тренер: {coachName}
                  </div>
                </div>

                {canManage && (
                  <div className="training-actions">
                    <button onClick={() => handleEdit(t)} className="btn-edit">
                      Редактировать
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="btn-delete">
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
