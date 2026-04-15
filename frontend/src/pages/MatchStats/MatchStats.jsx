import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMatchById } from "../../services/api";
import "./MatchStats.css";
import { getMatchStatusLabel } from "../../utils/dicts";
import MatchProtocol from "../../components/Protocols/MatchProtocol/MatchProtocol";

export default function MatchStats() {
	const { id } = useParams();
	const [match, setMatch] = useState(null);
	const [loading, setLoading] = useState(true);

	const [showStats, setShowStats] = useState(false);
	const [statsLoading, setStatsLoading] = useState(false);

	useEffect(() => {
		const fetchBasicData = async () => {
			try {
				const res = await getMatchById(id, { includeStats: false });
				setMatch(res.data?.data || res.data);
			} catch (err) {
				console.error("Ошибка загрузки матча:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchBasicData();
	}, [id]);

	const handleLoadStats = async () => {
		if (match?.playerStats) {
			setShowStats(true);
			return;
		}

		setStatsLoading(true);
		try {
			const res = await getMatchById(id, { includeStats: true });
			const fullData = res.data?.data || res.data;
			setMatch(fullData);
			setShowStats(true);
		} catch (err) {
			alert("Не удалось загрузить подробную статистику", err);
		} finally {
			setStatsLoading(false);
		}
	};

	if (loading)
		return (
			<div className="match-stats__loader">Подготовка протокола...</div>
		);
	if (!match) return <div className="match-stats__error">Матч не найден</div>;

	return (
		<div className="match-stats container">
			<header className="match-stats__header match-score">
				<div className="match-score__team match-score__team--home">
					<h2 className="match-score__name">{match.myTeam?.name}</h2>
					<span className="match-score__city">Дома</span>
				</div>

				<div className="match-score__board">
					<div className="match-score__result">
						{match.myScore} : {match.opponentScore}
					</div>
					<div className="match-score__status">
						{getMatchStatusLabel(match.status)}
					</div>
				</div>

				<div className="match-score__team match-score__team--away">
					<h2 className="match-score__name">{match.opponentName}</h2>
					<span className="match-score__city">Гости</span>
				</div>
			</header>

			<div className="match-stats__info match-info">
				<div className="match-info__item">
					<span className="match-info__label">Дата:</span>
					<span className="match-info__value">
						{new Date(match.matchDate).toLocaleDateString("ru-RU")}
					</span>
				</div>
				<div className="match-info__item">
					<span className="match-info__label">Арена:</span>
					<span className="match-info__value">{match.location}</span>
				</div>
			</div>

			<section className="match-stats__players player-stats">
				{!showStats ? (
					(match.status === "finished" ||
						match.playerStats?.length > 0) && (
						<div className="player-stats__placeholder">
							<button
								className="player-stats__load-btn"
								onClick={handleLoadStats}
								disabled={statsLoading}
							>
								{statsLoading
									? "Загрузка данных..."
									: "Смотреть полную статистику"}
							</button>
						</div>
					)
				) : match.playerStats && match.playerStats.length > 0 ? (
					<>
						<h3 className="player-stats__title">
							Статистика игроков
						</h3>
						<div className="player-stats__table-wrapper">
							<table className="player-stats__table">
								<thead>
									<tr>
										<th>#</th>
										<th>Игрок</th>
										<th title="Голы">Г</th>
										<th title="Передачи">П</th>
										<th title="Очки">О</th>
										<th title="Плюс/Минус">+/-</th>
										<th title="Броски">Бр</th>
										<th title="Силовые приемы">Хит</th>
										<th title="Вбрасывания">Вбр</th>
										<th title="Штрафное время">Штр</th>
										<th title="Время на льду">TOI</th>
									</tr>
								</thead>
								<tbody>
									{match.playerStats.map((record) => {
										const formatToi = (seconds) => {
											const mins = Math.floor(
												seconds / 60,
											);
											const secs = seconds % 60;
											return `${mins}:${secs.toString().padStart(2, "0")}`;
										};

										return (
											<tr key={record.id}>
												<td>
													{record.player?.number ||
														"—"}
												</td>
												<td className="player-stats__name">
													{record.player?.lastName}{" "}
													{record.player?.firstName}
												</td>
												<td>{record.goals}</td>
												<td>{record.assists}</td>
												<td className="player-stats__total">
													{record.goals +
														record.assists}
												</td>
												<td
													className={
														record.plusMinus > 0
															? "text-positive"
															: record.plusMinus <
																  0
																? "text-negative"
																: ""
													}
												>
													{record.plusMinus > 0
														? `+${record.plusMinus}`
														: record.plusMinus}
												</td>
												<td>{record.shots}</td>
												<td>{record.hits}</td>
												<td>{record.faceoffWins}</td>
												<td>
													{record.penaltyMinutes}'
												</td>
												<td>
													{formatToi(
														record.timeOnIce,
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
						<button
							className="player-stats__hide-btn"
							onClick={() => setShowStats(false)}
						>
							Скрыть статистику
						</button>
					</>
				) : (
					<div className="player-stats__empty">
						Протокол матча еще не заполнен
					</div>
				)}
			</section>
			<MatchProtocol />
		</div>
	);
}
