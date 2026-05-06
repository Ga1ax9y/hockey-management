import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTransferTypeLabel } from "../../../utils/dicts";
import "./PlayerTransfers.css";
import { isoToRuDate } from "../../../utils/date";
import { getTransfers } from "../../../services/api";
import Loader from "../../../components/layout/Loader/Loader";

export default function PlayerTransfers() {
  const { id } = useParams();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        const response = await getTransfers(id);
        setTransfers(response.data?.data || []);
      } catch (err) {
        console.error("Ошибка при загрузке истории переходов:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransfers();
  }, [id]);

  if (loading) return <Loader />;

  return (
    <div className="player-transfers container">
      <header className="player-transfers__header">
        <h1 className="player-transfers__title">ИСТОРИЯ ПЕРЕХОДОВ</h1>
      </header>

      <div className="player-transfers__content">
        {transfers.length === 0 ? (
          <div className="player-transfers__empty">
            <p className="player-transfers__empty-text">ИСТОРИЯ ПЕРЕХОДОВ ПУСТА</p>
            <p className="player-transfers__empty-sub">Игрок еще не менял команду</p>
          </div>
        ) : (
          <div className="player-transfers__list">
            {transfers.map((item) => (
              <div key={item.id} className="player-transfers__item">
                <div className="player-transfers__date-box">
                   <span className="player-transfers__date">
                     {isoToRuDate(item.transferDate)}
                   </span>
                   <span className="player-transfers__type-badge">
                     {getTransferTypeLabel(item.transferType) || "ПЕРЕВОД"}
                   </span>
                </div>

                <div className="player-transfers__route">
                  <div className="player-transfers__team player-transfers__team--from">
                    <span className="player-transfers__label">ИЗ</span>
                    <span className="player-transfers__team-name">{item.fromTeam?.name || "—"}</span>
                  </div>

                  <div className="player-transfers__arrow">→</div>

                  <div className="player-transfers__team player-transfers__team--to">
                    <span className="player-transfers__label">В</span>
                    <span className="player-transfers__team-name">{item.toTeam?.name || "—"}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
