import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTrainingById } from "../../services/api";
import "./TrainingStats.css";
import TrainingProtocol from "../../components/Protocols/TrainingProtocol/TrainingProtocol";
import { getTrainingStatusLabel } from "../../utils/dicts";
import { formatDateTimeToRU } from "../../utils/date";

export default function TrainingStats() {
    const { id } = useParams();
    const [training, setTraining] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showStats, setShowStats] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        const fetchBasicData = async () => {
            try {
                const res = await getTrainingById(id, { includeStats: false });
                setTraining(res.data?.data || res.data);
            } catch (err) {
                console.error("Ошибка загрузки тренировки:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBasicData();
    }, [id]);

    const handleLoadStats = async () => {
        if (training?.playerStats) {
            setShowStats(true);
            return;
        }

        setStatsLoading(true);
        try {
            const res = await getTrainingById(id, { includeStats: true });
            const fullData = res.data?.data || res.data;
            setTraining(fullData);
            setShowStats(true);
        } catch (err) {
            alert("Не удалось загрузить подробные результаты", err);
        } finally {
            setStatsLoading(false);
        }
    };

    if (loading)
        return <div className="training-stats__loader">Загрузка плана тренировки...</div>;

    if (!training)
        return <div className="training-stats__error">Тренировка не найдена</div>;

    return (
        <div className="training-stats container">
            <header className="training-stats__header training-summary">
                <div className="training-summary__main">
                    <h2 className="training-summary__title">{training.title || "Плановая тренировка"}</h2>
                    <span className="training-summary__team">{training.team?.name}</span>
                </div>

                <div className="training-summary__meta">
                    <div className="training-summary__type">
                        {getTrainingStatusLabel(training.trainingType) || "Лед"}
                    </div>
                    <div className="training-summary__date">
                        {formatDateTimeToRU(training.startTime)}
                    </div>
                </div>
            </header>

            <div className="training-stats__info training-info">
                <div className="training-info__item">
                    <span className="training-info__label">Локация:</span>
                    <span className="training-info__value">{training.location || "Основная арена"}</span>
                </div>
                <div className="training-info__item">
                    <span className="training-info__label">Конец:</span>
                    <span className="training-info__value">{formatDateTimeToRU(training.endTime)} мин.</span>
                </div>
            </div>

            <section className="training-stats__players player-stats">
                {!showStats ? (
                        <div className="player-stats__placeholder">
                            <button
                                className="player-stats__load-btn"
                                onClick={handleLoadStats}
                                disabled={statsLoading}
                            >
                                {statsLoading ? "Загрузка..." : "Показать итоги тренировки"}
                            </button>
                        </div>

                ) : training.playerStats && training.playerStats.length > 0 ? (
                    <>
                        <h3 className="player-stats__title">Оценки и комментарии</h3>
                        <div className="player-stats__table-wrapper">
                            <table className="player-stats__table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Игрок</th>
                                        <th title="Оценка тренера">Рейтинг</th>
                                        <th>Комментарий</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {training.playerStats.map((record) => (
                                        <tr key={record.id}>
                                            <td>{record.player?.number || "—"}</td>
                                            <td className="player-stats__name">
                                                {record.player?.lastName} {record.player?.firstName}
                                            </td>
                                            <td className="player-stats__rating">
                                                <span className={`rating-badge rating-badge--${Math.round(record.coachRating)}`}>
                                                    {record.coachRating}
                                                </span>
                                            </td>
                                            <td className="player-stats__description">
                                                {record.description || <span className="text-muted">Без замечаний</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            className="player-stats__hide-btn"
                            onClick={() => setShowStats(false)}
                        >
                            Скрыть подробности
                        </button>
                    </>
                ) : (
                    <div className="player-stats__empty">
                        Журнал тренировки пуст
                    </div>
                )}
            </section>

            <TrainingProtocol />
        </div>
    );
}
