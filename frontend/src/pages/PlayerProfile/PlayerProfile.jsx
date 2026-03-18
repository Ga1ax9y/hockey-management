import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {getPlayerById, markPlayerRecovered,} from '../../services/api';
import './PlayerProfile.css';
import { useRole } from '../../hooks/useRole';
import { CONTRACT_TYPE, MEDICAL_STATUS } from '../../utils/dicts';

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
  const { isDoctor } = useRole()


  const loadPlayerData = async () => {
    try {
      setLoading(true);
      const player = await getPlayerById(id, {includeTransfers: true,
                                              includeMedical: true,
                                              includePhysical:true,
                                              includeMatchStats: true,
                                              includeTrainingStats: true,
                                              includeReadinessIndex: true} )

      setPlayer(player.data);
      setMatchStats(player.data.matchStats);
      setTrainingStats(player.data.trainingStats);
      setCareerHistory(player.data.transfers);
      setMedicalHistory(player.data.medicalHistory);
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
const handleRecover = async (medicalId) => {

  await markPlayerRecovered(medicalId);

  const player = await getPlayerById(id, { includeMedical: true });

  setMedicalHistory([...(player.data?.medicalHistory || [])]);
};
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
        <h1>{player.lastName} {player.firstName}</h1>
        <p className="player-position">{player.position || 'Позиция не указана'}</p>
        <div className="player-basic-info">
          <span>Рост: {player.height || '—'} см</span>
          <span>Вес: {player.weight || '—'} кг</span>
          <span>Дата рождения: {player.birthDate ? new Date(player.birthDate).toLocaleDateString('ru-RU') : '—'}</span>
          <span>Контракт до: {player.contractExpiry ? new Date(player.contractExpiry).toLocaleDateString('ru-RU') : '—'}</span>
          <span>Тип контракта: {CONTRACT_TYPE[player.contractType] || '—'}</span>
        </div>
      </div>

      <div className="player-section">
        <h2>Матчевая статистика (последние 10)</h2>
        {matchStats?.length === 0 ? (
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
                  <td>{match.myTeam.name} – {match.opponentName}</td>
                  <td>{match.goals}</td>
                  <td>{match.assists}</td>
                  <td>{match.plusMinus}</td>
                  <td>{match.shots}</td>
                  <td>{match.hits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="player-section">
        <h2>Тренировки (последние 10)</h2>
        {trainingStats?.length === 0 ? (
          <p>Нет данных о тренировках</p>
        ) : (
          <div className="trainings-list">
            {trainingStats.map((train, i) => (
              <div key={i} className="training-card">
                <div className="training-header">
                  <span className="training-date">{new Date(train.trainingDate).toLocaleDateString('ru-RU')}</span>
                  <span className="training-type">{train.trainingType}</span>
                </div>
                <p><strong>Тренер:</strong> {train.coachName || '—'}</p>
                <p><strong>Оценка:</strong> {train.coachRating || '—'}</p>
                {train.description && <p>{train.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="player-section">
        <h2>История карьеры</h2>
        {careerHistory?.length === 0 ? (
          <p>Нет данных о карьере</p>
        ) : (
          <ul className="career-list">
            {careerHistory.map((item) => (
              <li key={item.id} className="career-item">
                <span className="career-date">{new Date(item.transferDate).toLocaleDateString('ru-RU')}</span>
                <span className="career-type">{item.transferType}</span>
                <span>из {item.fromTeam || '—'} → в {item.toTeam || '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="player-section">
        <h2>Медицинская история</h2>
        {medicalHistory?.length === 0 ? (
          <p>Нет медицинских записей</p>
        ) : (
          <ul className="medical-list">
            {medicalHistory.map((rec) => (
              <li key={rec.id} className="medical-item">
                <div className="medical-header">
                  <span className="medical-date">{new Date(rec.injuryDate).toLocaleDateString('ru-RU')}</span>
                  <span className="medical-status"> {MEDICAL_STATUS[rec.status]}</span>
                </div>
                <p><strong>Диагноз:</strong> {rec.diagnosis}</p>
                {rec.recoveryDate && (
                  <p><strong>Восстановление:</strong> {new Date(rec.recoveryDate).toLocaleDateString('ru-RU')}</p>
                )}
                {rec.status !== "recovered" && (
                  <button
                    className="btn-recover"
                    onClick={() => handleRecover(rec.id)}
                  >
                    Игрок восстановился
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {isDoctor && (
          <button
            className="btn-medical-add"
            onClick={() => navigate(`/players/${id}/medical`)}
          >
            Добавить медицинское заключение
          </button>
        )}
      </div>
    </div>
  );
}
