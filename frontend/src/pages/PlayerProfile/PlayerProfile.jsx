import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPlayerById,
  getPlayerMatchStats,
  getPlayerTrainingStats,
  getPlayerCareerHistory,
  getPlayerMedicalHistory,
} from '../../services/api';
import './PlayerProfile.css';

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [matchStats, setMatchStats] = useState([]);
  const [trainingStats, setTrainingStats] = useState([]);
  const [careerHistory, setCareerHistory] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      const [
        profileRes,
        matchRes,
        trainingRes,
        careerRes,
        medicalRes
      ] = await Promise.all([
        getPlayerById(id),
        getPlayerMatchStats(id),
        getPlayerTrainingStats(id),
        getPlayerCareerHistory(id),
        getPlayerMedicalHistory(id),
      ]);

      setPlayer(profileRes.data);
      setMatchStats(matchRes.data);
      setTrainingStats(trainingRes.data);
      setCareerHistory(careerRes.data);
      setMedicalHistory(medicalRes.data);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить профиль игрока');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayerData();
  }, [id]);

  if (loading) return <div className="player-profile-loading">Загрузка профиля...</div>;
  if (error) return <div className="player-profile-error">{error}</div>;
  if (!player) return null;

  return (
    <div className="player-profile">
      <button
        className="player-profile-back"
        onClick={() => navigate(-1)}
      >
        ← Назад
      </button>

      <div className="player-header">
        <h1>{player.last_name} {player.first_name}</h1>
        <p className="player-position">{player.position || 'Позиция не указана'}</p>
        <div className="player-basic-info">
          <span>Рост: {player.height || '—'} см</span>
          <span>Вес: {player.weight || '—'} кг</span>
          <span>Дата рождения: {player.birth_date ? new Date(player.birth_date).toLocaleDateString('ru-RU') : '—'}</span>
          <span>Контракт до: {player.contract_expiry ? new Date(player.contract_expiry).toLocaleDateString('ru-RU') : '—'}</span>
        </div>
      </div>

      <div className="player-section">
        <h2>Матчевая статистика (последние 10)</h2>
        {matchStats.length === 0 ? (
          <p>Нет данных о матчах</p>
        ) : (
          <table className="stats-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Матч</th>
                <th>Голы</th>
                <th>Пасы</th>
                <th>+/-</th>
                <th>Броски</th>
                <th>Силовые</th>
              </tr>
            </thead>
            <tbody>
              {matchStats.map((match, i) => (
                <tr key={i}>
                  <td>{new Date(match.match_date).toLocaleDateString('ru-RU')}</td>
                  <td>{match.home_team} – {match.away_team}</td>
                  <td>{match.goals}</td>
                  <td>{match.assists}</td>
                  <td>{match.plus_minus}</td>
                  <td>{match.shots}</td>
                  <td>{match.hits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="player-section">
        <h2>Тренировки (последние 5)</h2>
        {trainingStats.length === 0 ? (
          <p>Нет данных о тренировках</p>
        ) : (
          <div className="trainings-list">
            {trainingStats.map((train, i) => (
              <div key={i} className="training-card">
                <div className="training-header">
                  <span className="training-date">{new Date(train.training_date).toLocaleDateString('ru-RU')}</span>
                  <span className="training-type">{train.training_type}</span>
                </div>
                <p><strong>Тренер:</strong> {train.coach_name || '—'}</p>
                <p><strong>Оценка:</strong> {train.coach_rating || '—'}</p>
                {train.description && <p>{train.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="player-section">
        <h2>История карьеры</h2>
        {careerHistory.length === 0 ? (
          <p>Нет данных о карьере</p>
        ) : (
          <ul className="career-list">
            {careerHistory.map((item) => (
              <li key={item.id} className="career-item">
                <span className="career-date">{new Date(item.transfer_date).toLocaleDateString('ru-RU')}</span>
                <span className="career-type">{item.transfer_type}</span>
                <span>из {item.from_team || '—'} → в {item.to_team || '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="player-section">
        <h2>Медицинская история</h2>
        {medicalHistory.length === 0 ? (
          <p>Нет медицинских записей</p>
        ) : (
          <ul className="medical-list">
            {medicalHistory.map((rec) => (
              <li key={rec.id} className="medical-item">
                <div className="medical-header">
                  <span className="medical-date">{new Date(rec.injury_date).toLocaleDateString('ru-RU')}</span>
                  <span className="medical-status">{rec.status}</span>
                </div>
                <p><strong>Диагноз:</strong> {rec.diagnosis}</p>
                {rec.recovery_date && (
                  <p><strong>Восстановление:</strong> {new Date(rec.recovery_date).toLocaleDateString('ru-RU')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
