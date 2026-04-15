import Loader from '../../layout/Loader/Loader'
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMatchById, syncMatchStats } from '../../../services/api';
import '../Protocols.css';


export default function MatchProtocol() {
    const { id } = useParams();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingRows, setSavingRows] = useState(new Set());

useEffect(() => {
    const load = async () => {
        try {
            const res = await getMatchById(id, { includeStats: true });
            const data = res.data?.data || res.data;

            const currentTeamPlayers = data.myTeam?.players || [];
            const existingStats = data.playerStats || [];

            const allParticipantsMap = new Map();

            existingStats.forEach(stat => {
                allParticipantsMap.set(stat.playerId, {
                    ...stat,
                    player: stat.player,
                    isHistorical: stat.player.currentTeamId !== data.myTeamId
                });
            });

            currentTeamPlayers.forEach(player => {
                if (!allParticipantsMap.has(player.id)) {
                    allParticipantsMap.set(player.id, {
                        playerId: player.id,
                        player: player,
                        goals: 0, assists: 0, shots: 0, hits: 0,
                        penaltyMinutes: 0, plusMinus: 0, faceoffWins: 0, timeOnIce: 0
                    });
                }
            });

            setPlayers(Array.from(allParticipantsMap.values()));
        } finally {
            setLoading(false);
        }
    };
    load();
}, [id]);
useEffect(() => {
    const load = async () => {
        try {
            const res = await getMatchById(id, { includeStats: true });
            const data = res.data?.data || res.data;

            const currentTeamPlayers = data.myTeam?.players || [];
            const existingStats = data.playerStats || [];

            const allParticipantsMap = new Map();

            existingStats.forEach(stat => {
                allParticipantsMap.set(stat.playerId, {
                    ...stat,
                    player: stat.player,
                    isHistorical: stat.player.currentTeamId !== data.myTeamId
                });
            });

            currentTeamPlayers.forEach(player => {
                if (!allParticipantsMap.has(player.id)) {
                    allParticipantsMap.set(player.id, {
                        playerId: player.id,
                        player: player,
                        goals: 0, assists: 0, shots: 0, hits: 0,
                        penaltyMinutes: 0, plusMinus: 0, faceoffWins: 0, timeOnIce: 0
                    });
                }
            });

            setPlayers(Array.from(allParticipantsMap.values()));
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
            const res = await syncMatchStats({
                ...playerData,
                matchId: Number(id)
            });

            const savedData = res.data;
            setPlayers(prev => prev.map(p =>
                p.playerId === playerData.playerId ? { ...p, ...savedData } : p
            ));

        } catch (err) {
            console.error("Ошибка синхронизации:", err);
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
                <h1 className="protocol__title">Протокол матча</h1>
                <div className="protocol__badge">Автосохранение активно</div>
            </header>

            <div className="protocol__table-wrapper">
                <table className="protocol-table">
                    <thead>
                        <tr className="protocol-table__row">
                            <th className="protocol-table__th">#</th>
                            <th className="protocol-table__th">Игрок</th>
                            {['Г', 'П', 'Ш', 'Хит', '+/-', 'Вбр', 'Штр', 'TOI'].map(h => (
                                <th key={h} className="protocol-table__th">{h}</th>
                            ))}
                            <th className="protocol-table__th"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="11"><Loader /></td></tr>
                        ) : (
                            players.map(p => (
                                <tr
                                    key={p.playerId}
                                    className={`protocol-table__row ${savingRows.has(p.playerId) ? 'protocol-table__row--saving' : ''}`}
                                    onBlur={(e) => handleRowBlur(e, p)}
                                >
                                    <td className="protocol-table__td">{p.player?.number}</td>
                                    <td className="protocol-table__td protocol-table__td--name">
                                        {p.player?.lastName} {p.player?.firstName}
                                    </td>

                                    {[
                                        'goals', 'assists', 'shots', 'hits',
                                        'plusMinus', 'faceoffWins', 'penaltyMinutes', 'timeOnIce'
                                    ].map(field => (
                                        <td key={field} className="protocol-table__td">
                                            <input
                                                type="number"
                                                className="protocol-table__input"
                                                min={field === 'plusMinus' ? undefined : 0}
                                                value={p[field] ?? 0}
                                                onChange={e => handleChange(p.playerId, field, e.target.value)}
                                            />
                                        </td>
                                    ))}

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
