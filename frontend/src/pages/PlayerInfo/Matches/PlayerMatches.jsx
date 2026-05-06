import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMatchStats } from "../../../services/api";
import "./PlayerMatches.css";
import Loader from "../../../components/layout/Loader/Loader";
import { isoToRuDate } from "../../../utils/date";
export default function PlayerMatches() {
	const { id } = useParams();
	const [stats, setStats] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setLoading(true);
				const response = await getMatchStats(id);
				setStats(response.data.data || []);
			} catch (err) {
				console.error("Ошибка при загрузке статистики:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, [id]);

	if (loading) return <Loader />;

	return (
		<div className="player-matches container">
			<header className="player-matches__header">
				<h1 className="player-matches__title">ИСТОРИЯ ВЫСТУПЛЕНИЙ</h1>
			</header>

			<div className="player-matches__table-container">
				<table className="player-matches__table">
					<thead className="player-matches__thead">
						<tr>
							<th>#</th>
							<th>Матч / Дата</th>
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
					<tbody className="player-matches__tbody">
						{stats.map((item, index) => (
							<tr key={item.id} className="player-matches__row">
								<td className="player-matches__cell--num">
									{index + 1}
								</td>
								<td className="player-matches__cell--main">
									<Link
										to={`/matches/${item.match.id}`}
										className="player-matches__link"
									>
										<div className="player-matches__opponent">
											{item.match.opponentName}
										</div>
									</Link>
									<div className="player-matches__date">
										{isoToRuDate(item.match.matchDate)}
									</div>
								</td>
								<td>{item.goals}</td>
								<td>{item.assists}</td>
								<td className="player-matches__cell--accent">
									{item.goals + item.assists}
								</td>
								<td
									className={
										item.plusMinus > 0
											? "text-pos"
											: item.plusMinus < 0
												? "text-neg"
												: ""
									}
								>
									{item.plusMinus > 0
										? `+${item.plusMinus}`
										: item.plusMinus}
								</td>
								<td>{item.shots}</td>
								<td>{item.hits || 0}</td>
								<td>{item.faceoffsWon || 0}</td>
								<td>{item.penaltyMinutes || 0}'</td>
								<td className="player-matches__cell--toi">
									{item.timeOnIce || "00:00"}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
