import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  changePlayerTeam,
  getPlayerById,
  getTeams,
  markPlayerRecovered,
} from "../../services/api";
import "./PlayerProfile.css";
import { useRole } from "../../hooks/useRole";
import { CONTRACT_TYPE, getMedicalLabel, TRANSFER_TYPE } from "../../utils/dicts";
import ErrorPage from "../Error/ErrorPage";

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [matchStats, setMatchStats] = useState([]);
  const [trainingStats, setTrainingStats] = useState([]);
  const [careerHistory, setCareerHistory] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [loading, setLoading] = useState(true);
  const [transferLoading, setTransferLoading] = useState(false);
  const [error, setError] = useState("");
  const { isDoctor, isAdmin, isCoach } = useRole();
  const isTransferAvailable =
    player?.contractType === "TWO_WAY" ||
    player?.contractType === "ENTRY_LEVEL";

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      const [player, teamsData] = await Promise.all([
        getPlayerById(id, {
          includeTransfers: true,
          includeMedical: true,
          includePhysical: true,
          includeMatchStats: true,
          includeTrainingStats: true,
          includeReadinessIndex: true,
        }),
        getTeams(),
      ]);
      setPlayer(player.data);
      setMatchStats(player.data.matchStats);
      setTrainingStats(player.data.trainingStats);
      setCareerHistory(player.data.transfers);
      setMedicalHistory(player.data.medicalHistory);
      setTeams(teamsData.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayerData();
  }, [id]);

  const handleTransfer = async () => {
    if (!selectedTeam) return alert("Выберите команду");

    try {
      setTransferLoading(true);
      await changePlayerTeam(id, selectedTeam);
      alert("Команда успешно изменена");
      loadPlayerData();
    } catch (err) {
      setError(err.response?.data);
      console.error(err);
    } finally {
      setTransferLoading(false);
    }
  };
  const handleRecover = async (medicalId) => {
    await markPlayerRecovered(medicalId);

    const player = await getPlayerById(id, { includeMedical: true });

    setMedicalHistory([...(player.data?.medicalHistory || [])]);
  };

  if (loading)
    return <div className="player-profile-loading">Загрузка профиля...</div>;
  if (error) return <ErrorPage error={error} />;
  if (!player) return null;

  return (
    <div className="player-profile">
      <button className="player-profile-back" onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <div className="player-header">
        <h1>
          {player.lastName} {player.firstName}
        </h1>
        <p className="player-position">
          {player.position || "Позиция не указана"}
        </p>
        <div className="player-basic-info">
          <span>Рост: {player.height || "—"} см</span>
          <span>Вес: {player.weight || "—"} кг</span>
          <span>
            Дата рождения:{" "}
            {player.birthDate
              ? new Date(player.birthDate).toLocaleDateString("ru-RU")
              : "—"}
          </span>
          <span>
            Контракт до:{" "}
            {player.contractExpiry
              ? new Date(player.contractExpiry).toLocaleDateString("ru-RU")
              : "—"}
          </span>
          <span>
            Тип контракта: {CONTRACT_TYPE[player.contractType] || "—"}
          </span>
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
              {matchStats.map((matchStat, i) => (
                <tr key={i}>
                  <td>
                    {new Date(matchStat.match.matchDate).toLocaleDateString("ru-RU")}
                  </td>
                  <td>
                    {matchStat.match.opponentName}
                  </td>
                  <td>{matchStat.goals}</td>
                  <td>{matchStat.assists}</td>
                  <td>{matchStat.plusMinus}</td>
                  <td>{matchStat.shots}</td>
                  <td>{matchStat.hits}</td>
                  <td>{matchStat.timeOnIce}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="player-section transfer-section">
        <h2>Управление переводом</h2>
        <div
          className={`transfer-control ${!isTransferAvailable ? "disabled" : ""}`}
        >
          {isTransferAvailable ? (
            <div className="transfer-form">
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                disabled={transferLoading}
              >
                <option value="">Выберите новую команду</option>
                {teams
                  .filter((t) => t.id !== player.currentTeamId)
                  .map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
              </select>
              <button
                onClick={handleTransfer}
                disabled={transferLoading || !selectedTeam}
                className="btn-transfer"
              >
                {transferLoading ? "Перевод..." : "Перевести игрока"}
              </button>
            </div>
          ) : (
            <p className="transfer-restriction-msg">
              Доступно только для игроков с двусторонним контрактом или
              контрактом новичка
            </p>
          )}
        </div>
      </div>
      <div className="player-section">
        <h2>Тренировки (последние 10)</h2>
        {trainingStats?.length === 0 ? (
          <p>Нет данных о тренировках</p>
        ) : (
          <div className="trainings-list">
            {trainingStats.map((trainingStat, i) => (
              <div key={i} className="training-card">
                <div className="training-header">
                  <span className="training-date">
                    {new Date(trainingStat.training.startTime).toLocaleDateString("ru-RU")}
                  </span>
                  <span className="training-type">{trainingStat.training.trainingType}</span>
                </div>
                <p>
                  <strong>Тренер:</strong> {trainingStat.training.coach.fullName || "—"}
                </p>
                <p>
                  <strong>Оценка:</strong> {trainingStat.coachRating || "—"}
                </p>
                {trainingStat.description && <p>{trainingStat.description}</p>}
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
                <span className="career-date">
                  {new Date(item.transferDate).toLocaleDateString("ru-RU")}
                </span>
                <span className="career-type">{TRANSFER_TYPE[item.transferType]}:</span>
                <span>
                  из {item.fromTeam.name || "—"} → в {item.toTeam.name || "—"}
                </span>
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
                  <span className="medical-date">
                    {new Date(rec.injuryDate).toLocaleDateString("ru-RU")}
                  </span>
                  <span className="medical-status">
                    {" "}
                    {getMedicalLabel(rec.status)}
                  </span>
                </div>
                <p>
                  <strong>Диагноз:</strong> {rec.diagnosis}
                </p>
                {rec.recoveryDate && (
                  <p>
                    <strong>Восстановление:</strong>{" "}
                    {new Date(rec.recoveryDate).toLocaleDateString("ru-RU")}
                  </p>
                )}

                {rec.status !== "recovered" && isDoctor && (
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

        {(isDoctor || isAdmin) && (
          <button
            className="btn-medical-add"
            onClick={() => navigate(`/players/${id}/medicals`)}
          >
            Смотреть полную медицинскую историю
          </button>
        )}
        {(isCoach || isAdmin) && (
          <button
            className="btn-medical-add"
            onClick={() => navigate(`/players/${id}/physicals`)}
          >
            Смотреть все физические данные
          </button>
        )}
      </div>
    </div>
  );
}
