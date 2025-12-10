import { useState, useEffect } from 'react';
import { getTeams, createTeam } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './Hierarchy.css';

export default function Hierarchy() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTeam, setNewTeam] = useState({
    team_name: '',
    league: '',
    level: 1,
    season: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1).toString().slice(-2),
  });

  const loadTeams = async () => {
    try {
      setLoading(true);
      const res = await getTeams();
      const sorted = res.data.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.team_name.localeCompare(b.team_name);
      });
      setTeams(sorted);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить команды');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTeam(newTeam);
      setNewTeam({
        team_name: '',
        league: '',
        level: 1,
        season: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1).toString().slice(-2),
      });
      setIsCreating(false);
      loadTeams();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при создании команды');
    }
  };

  if (loading) return <div className="hierarchy-loading">Загрузка иерархии...</div>;
  if (error) return <div className="hierarchy-error">{error}</div>;

  return (
    <div className="hierarchy">
      <h2>Иерархия команд</h2>

      <button
        className="hierarchy-add-btn"
        onClick={() => setIsCreating(!isCreating)}
      >
        {isCreating ? 'Отменить' : 'Добавить команду'}
      </button>

      {isCreating && (
        <form className="hierarchy-create-form" onSubmit={handleCreate}>
          <div className="form-group">
            <label>Название команды *</label>
            <input
              type="text"
              value={newTeam.team_name}
              onChange={(e) => setNewTeam({ ...newTeam, team_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Лига (опционально)</label>
            <input
              type="text"
              value={newTeam.league}
              onChange={(e) => setNewTeam({ ...newTeam, league: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Уровень *</label>
            <input
              type="number"
              min="1"
              value={newTeam.level}
              onChange={(e) => setNewTeam({ ...newTeam, level: Number(e.target.value) })}
              required
            />
            <small>Уровни иерархии идут по убыванию, начиная с 1</small>
          </div>
          <div className="form-group">
            <label>Сезон *</label>
            <input
              type="text"
              placeholder="Например: 2025/25"
              pattern="\d{4}/\d{2}"
              value={newTeam.season}
              onChange={(e) => setNewTeam({ ...newTeam, season: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="hierarchy-submit-btn">Создать команду</button>
        </form>
      )}

      {teams.length === 0 ? (
        <p className="hierarchy-empty">Нет созданных команд</p>
      ) : (
        <div className="hierarchy-tree">
          {Array.from(new Set(teams.map(t => t.level)))
            .sort((a, b) => a - b)
            .map(level => (
              <div key={level} className="hierarchy-level">
                <h3>Уровень {level}</h3>
                {teams
                .filter(t => t.level === level)
                .map(team => (
                    <div
                    key={team.id}
                    className="hierarchy-team-card clickable"
                    onClick={() => navigate(`/teams/${team.id}`)}
                    >
                    <div className="team-name">{team.team_name}</div>
                    <div className="team-meta">
                        {team.league && <span className="team-league">{team.league}</span>}
                        <span className="team-season">{team.season}</span>
                    </div>
                    </div>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
