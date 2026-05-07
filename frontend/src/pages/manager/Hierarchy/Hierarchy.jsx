import { useState, useEffect } from 'react';
import { getTeams, createTeam } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../../hooks/useRole';
import './Hierarchy.css';

export default function Hierarchy() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    league: '',
    level: 1,
    season: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1).toString().slice(-2),
  });
  const { isAdmin, isManager } = useRole();

  const loadTeams = async () => {
    try {
      setLoading(true);
      const res = await getTeams();
      const teamsArray = res.data.data;
      const sorted = teamsArray.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
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
        name: '',
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

  if (loading) return <div className="hierarchy__status">Загрузка иерархии...</div>;
  if (error) return <div className="hierarchy__status hierarchy__status--error">{error}</div>;

  return (
    <section className="hierarchy container">
      <header className="hierarchy__header">
        <h2 className="hierarchy__title">Иерархия команд</h2>
        {(isAdmin || isManager) && (
          <button
            className={`hierarchy__add-btn ${isCreating ? 'hierarchy__add-btn--active' : ''}`}
            onClick={() => setIsCreating(!isCreating)}
          >
            {isCreating ? 'Отменить' : 'Добавить команду'}
          </button>
        )}
      </header>

      {isCreating && (
        <div className="hierarchy__create-wrapper">
          <form className="hierarchy__form form-block" onSubmit={handleCreate}>
            <div className="hierarchy__field form-block__field">
              <label className="hierarchy__label form-block__label">Название команды *</label>
              <input
                type="text"
                className="hierarchy__input form-block__input"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                required
              />
            </div>

            <div className="form-block__row">
               <div className="hierarchy__field form-block__field">
                <label className="hierarchy__label form-block__label">Лига</label>
                <input
                  type="text"
                  className="hierarchy__input form-block__input"
                  value={newTeam.league}
                  onChange={(e) => setNewTeam({ ...newTeam, league: e.target.value })}
                />
              </div>
              <div className="hierarchy__field form-block__field">
                <label className="hierarchy__label form-block__label">Сезон *</label>
                <input
                  type="text"
                  className="hierarchy__input form-block__input"
                  placeholder="2025/26"
                  pattern="\d{4}/\d{2}"
                  value={newTeam.season}
                  onChange={(e) => setNewTeam({ ...newTeam, season: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="hierarchy__field form-block__field">
              <label className="hierarchy__label form-block__label">Уровень иерархии *</label>
              <input
                type="number"
                min="1"
                className="hierarchy__input form-block__input"
                value={newTeam.level}
                onChange={(e) => setNewTeam({ ...newTeam, level: Number(e.target.value) })}
                required
              />
              <small className="hierarchy__help">Уровни идут по убыванию (1 — высший)</small>
            </div>

            <button type="submit" className="hierarchy__submit form-block__submit">
              Создать команду
            </button>
          </form>
        </div>
      )}

      {teams.length === 0 ? (
        <p className="hierarchy__empty">Нет созданных команд</p>
      ) : (
        <div className="hierarchy__tree">
          {Array.from(new Set(teams.map(t => t.level)))
            .sort((a, b) => a - b)
            .map(level => (
              <div key={level} className="hierarchy__level">
                <div className="hierarchy__level-badge">Уровень {level}</div>
                <div className="hierarchy__level-grid">
                  {teams
                    .filter(t => t.level === level)
                    .map(team => (
                      <article
                        key={team.id}
                        className="hierarchy__team-card"
                        onClick={() => navigate(`/teams/${team.id}`)}
                      >
                        <h4 className="hierarchy__team-name">{team.name}</h4>
                        <div className="hierarchy__team-meta">
                          {team.league && <span className="hierarchy__team-league">{team.league}</span>}
                          <span className="hierarchy__team-season">{team.season}</span>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
