import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTrainingById, syncTrainingStats } from '../../../services/api';
import Loader from '../../layout/Loader/Loader'


export default function TrainingProtocol() {
    const { id } = useParams();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingRows, setSavingRows] = useState(new Set());

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getTrainingById(id, { includeStats: true });
                const data = res.data?.data || res.data;

                const currentTeamPlayers = data.team?.players || [];
                const existingStats = data.playerStats || [];

                const allParticipantsMap = new Map();

                existingStats.forEach(stat => {
                    allParticipantsMap.set(stat.playerId, {
                        ...stat,
                        player: stat.player,
                        isHistorical: stat.player.currentTeamId !== data.teamId
                    });
                });

                currentTeamPlayers.forEach(player => {
                    if (!allParticipantsMap.has(player.id)) {
                        allParticipantsMap.set(player.id, {
                            playerId: player.id,
                            player: player,
                            coachRating: 10,
                            description: ""
                        });
                    }
                });

                setPlayers(Array.from(allParticipantsMap.values()));
            } catch (err) {
                console.error("Ошибка инициализации протокола тренировки:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleChange = (playerId, field, val) => {
        setPlayers(prev => prev.map(p =>
            p.playerId === playerId ? { ...p, [field]: val } : p
        ));
    };

    const saveRow = async (playerData) => {
        setSavingRows(prev => new Set(prev).add(playerData.playerId));
        try {
            const res = await syncTrainingStats({
                ...playerData,
                trainingId: Number(id)
            });

            const savedData = res.data;
            setPlayers(prev => prev.map(p =>
                p.playerId === playerData.playerId ? { ...p, ...savedData } : p
            ));
        } catch (err) {
            console.error("Ошибка сохранения тренировки:", err);
        } finally {
            setSavingRows(prev => {
                const next = new Set(prev);
                next.delete(playerData.playerId);
                return next;
            });
        }
    };

    const handleRowBlur = (e, playerData) => {
        const currentTarget = e.currentTarget;
        setTimeout(() => {
            if (!currentTarget.contains(document.activeElement)) {
                saveRow(playerData);
            }
        }, 50);
    };

    return (
        <div className="protocol container">
            <header className="protocol__header">
                <h1 className="protocol__title">Журнал тренировки</h1>
                <div className="protocol__badge">Синхронизация включена</div>
            </header>

            <div className="protocol__table-wrapper">
                <table className="protocol-table">
                    <thead>
                        <tr className="protocol-table__row">
                            <th className="protocol-table__th">#</th>
                            <th className="protocol-table__th">Игрок</th>
                            <th className="protocol-table__th">Оценка (1-10)</th>
                            <th className="protocol-table__th">Комментарий тренера</th>
                            <th className="protocol-table__th"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5"><Loader /></td></tr>
                        ) : (
                            players.map(p => (
                                <tr
                                    key={p.playerId}
                                    className={`protocol-table__row ${savingRows.has(p.playerId) ? 'protocol-table__row--saving' : ''}`}
                                    onBlur={(e) => handleRowBlur(e, p)}
                                >
                                    <td className="protocol-table__td">{p.player?.number || '—'}</td>
                                    <td className="protocol-table__td protocol-table__td--name">
                                        {p.player?.lastName} {p.player?.firstName}
                                    </td>

                                    <td className="protocol-table__td">
                                        <input
                                            type="number"
                                            min="1" max="10"
                                            className="protocol-table__input protocol-table__input--rating"
                                            value={p.coachRating || ''}
                                            onChange={e => handleChange(p.playerId, 'coachRating', e.target.value)}
                                        />
                                    </td>

                                    <td className="protocol-table__td">
                                        <textarea
                                            className="protocol-table__textarea"
                                            placeholder="Опишите работу игрока..."
                                            value={p.description || ''}
                                            onChange={e => handleChange(p.playerId, 'description', e.target.value)}
                                        />
                                    </td>

                                    <td className="protocol-table__td protocol-table__td--status">
                                        {savingRows.has(p.playerId) ? (
                                            <span className="protocol-table__sync-icon">...</span>
                                        ) : (
                                            <span className="protocol-table__check-icon">✓</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
