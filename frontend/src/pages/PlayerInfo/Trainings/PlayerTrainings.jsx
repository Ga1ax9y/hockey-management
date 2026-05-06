import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTrainingStats } from "../../../services/api";
import "./PlayerTrainings.css";
import Loader from "../../../components/layout/Loader/Loader";
import { isoToRuDate } from "../../../utils/date";
import { getTrainingStatusLabel } from "../../../utils/dicts";

export default function PlayerTrainings() {
  const { id } = useParams();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        const response = await getTrainingStats(id);
        setTrainings(response.data.data || []);
      } catch (err) {
        console.error("Ошибка при загрузке статистики тренировок:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainings();
  }, [id]);

  if (loading) return <Loader />;

  return (
    <div className="player-trainings container">
      <header className="player-trainings__header">
        <h1 className="player-trainings__title">ЖУРНАЛ ТРЕНИРОВОК</h1>
      </header>

      <div className="player-trainings__table-container">
        {trainings.length === 0 ? (
          <div className="player-trainings__empty">
            <div className="player-trainings__empty-box">
              <p className="player-trainings__empty-text">ДАННЫЕ О ТРЕНИРОВКАХ ОТСУТСТВУЮТ</p>
              <span className="player-trainings__empty-sub">Записей в системе пока нет</span>
            </div>
          </div>
        ) : (
          <table className="player-trainings__table">
            <thead className="player-trainings__thead">
              <tr>
                <th>ДАТА</th>
                <th>ТИП ТРЕНИРОВКИ</th>
                <th>ТРЕНЕР</th>
                <th>ОЦЕНКА</th>
                <th>КОММЕНТАРИЙ</th>
              </tr>
            </thead>
            <tbody className="player-trainings__tbody">
              {trainings.map((item) => (
                <tr key={item.id} className="player-trainings__row">
                  <td className="player-trainings__cell--date">
                    {isoToRuDate(item.training.startTime)}
                  </td>
                  <td className="player-trainings__cell--type">
                    <span className="player-trainings__type-label">
                      {getTrainingStatusLabel(item.training.trainingType)}
                    </span>
                  </td>
                  <td className="player-trainings__cell--coach">
                    {item.training.coach?.fullName || "—"}
                  </td>
                  <td className="player-trainings__cell--rating">
                    <div className={`player-trainings__rating-circle ${
                      item.coachRating >= 8 ? "player-trainings__rating-circle--high" :
                      item.coachRating <= 4 ? "player-trainings__rating-circle--low" : ""
                    }`}>
                      {item.coachRating || "0"}
                    </div>
                  </td>
                  <td className="player-trainings__cell--comment">
                    {item.description || <span className="player-trainings__none">Записей нет</span>}
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
