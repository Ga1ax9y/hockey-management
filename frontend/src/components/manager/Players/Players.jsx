import { useState, useEffect } from 'react';
import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getTeams
} from '../../../services/api';
import './Players.css';
import { ruDateToISO, isoToRuDate } from '../../../utils/date';

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    position: '',
    height: '',
    weight: '',
    contractExpiry: '',
    currentTeamId: '',
  });

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const res = await getPlayers({includeCurrentTeam: true});
      setPlayers(res.data.data);
      const teamsRes = await getTeams();
      const teamsArray = teamsRes.data.data
      setTeams(teamsArray);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить игроков');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const resetForm = () => {
    setFormData({
      lastName: '',
      firstName: '',
      middleName: '',
      birthDate: '',
      position: '',
      height: '',
      weight: '',
      contractExpiry: '',
      currentTeamId: '',
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      height: formData.height ? Number(formData.height) : null,
      weight: formData.weight ? Number(formData.weight) : null,
      currentTeamId: formData.currentTeamId ? Number(formData.currentTeamId) : null,
      birthDate: ruDateToISO(formData.birthDate),
      contractExpiry: ruDateToISO(formData.contractExpiry),
    };

    if (!submitData.birthDate) {
      setError('Дата рождения должна быть в формате ДД.ММ.ГГГГ');
      return;
    }

    try {
      if (editingId) {
        await updatePlayer(editingId, submitData);
      } else {
        await createPlayer(submitData);
      }
      resetForm();
      loadPlayers();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при сохранении игрока');
    }
  };

  const handleEdit = (player) => {
    setFormData({
      lastName: player.lastName || '',
      firstName: player.firstName || '',
      middleName: player.middleName || '',
      birthDate: isoToRuDate(player.birthDate),
      position: player.position || '',
      height: player.height?.toString() || '',
      weight: player.weight?.toString() || '',
      contractExpiry: isoToRuDate(player.contractExpiry),
      currentTeamId: player.currentTeamId?.toString() || '',
    });
    setEditingId(player.id);
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить игрока? Это действие нельзя отменить.')) return;
    try {
      await deletePlayer(id);
      loadPlayers();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при удалении игрока');
    }
  };

  if (loading) return <div className="players-loading">Загрузка игроков...</div>;
  if (error) return <div className="players-error">{error}</div>;

  return (
    <div className="players">
      <h2>Управление игроками</h2>

      <button
        className="players-add-btn"
        onClick={() => {
          resetForm();
          setIsCreating(!isCreating);
        }}
      >
        {isCreating ? 'Отменить' : 'Добавить игрока'}
      </button>

      {isCreating && (
        <form className="players-form" onSubmit={handleSubmit}>
          <div className="players-form-row">
            <div className="players-form-group">
              <label>Фамилия</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
            <div className="players-form-group">
              <label>Имя</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="players-form-group">
              <label>Отчество</label>
              <input
                type="text"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              />
            </div>
          </div>

          <div className="players-form-row">
            <div className="players-form-group">
              <label>Дата рождения</label>
              <input
                type="text"
                placeholder="15.08.2005"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
              />
            </div>
            <div className="players-form-group">
              <label>Позиция</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
            <div className="players-form-group">
              <label>Рост (см)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              />
            </div>
            <div className="players-form-group">
              <label>Вес (кг)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>
          </div>

          <div className="players-form-row">
            <div className="players-form-group">
              <label>Окончание контракта</label>
              <input
                type="text"
                placeholder="01.06.2026"
                value={formData.contractExpiry}
                onChange={(e) => setFormData({ ...formData, contractExpiry: e.target.value })}
              />
            </div>
            <div className="players-form-group">
              <label>Команда</label>
              <select
                value={formData.currentTeamId || ''}
                onChange={(e) => setFormData({ ...formData, currentTeamId: e.target.value })}
              >
                <option value="">Не выбрана</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} (ID: {team.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="players-form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Сохранить изменения' : 'Добавить игрока'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="players-list">
        {players.length === 0 ? (
          <p className="players-empty">Нет добавленных игроков</p>
        ) : (
          <table className="players-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ФИО</th>
                <th>Дата рождения</th>
                <th>Позиция</th>
                <th>Рост/Вес</th>
                <th>Контракт до</th>
                <th>Команда</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id}>
                  <td>{player.id}</td>
                  <td>
                    {player.lastName} {player.firstName}
                    {player.middleName && ` ${player.middleName}`}
                  </td>
                  <td>{isoToRuDate(player.birthDate)}</td>
                  <td>{player.position || '—'}</td>
                  <td>
                    {player.height && `${player.height} см`}
                    {player.weight && ` / ${player.weight} кг`}
                  </td>
                  <td>{player.contractExpiry ? isoToRuDate(player.contractExpiry) : '—'}</td>
                  <td>{player.currentTeam?.name || '—'}</td>
                  <td data-label="Действия">
                    <div className="players-actions">
                      <button onClick={() => handleEdit(player)} className="btn-edit">
                        Редактировать
                      </button>
                      <button onClick={() => handleDelete(player.id)} className="btn-delete">
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
