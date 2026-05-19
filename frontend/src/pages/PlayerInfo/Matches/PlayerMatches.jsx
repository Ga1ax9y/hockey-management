import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMatchStats } from "../../../services/api";
import "./PlayerMatches.css";
import Loader from "../../../components/layout/Loader/Loader";
import { isoToRuDate } from "../../../utils/date";
import Pagination from "../../../components/layout/Pagination/Pagination";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
export default function PlayerMatches() {
	const { id } = useParams();
	const [stats, setStats] = useState([]);
	const [page, setPage] = useState(1);
	const [meta, setMeta] = useState(null);
	const [loading, setLoading] = useState(true);

	const handlePageChange = (newPage) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	useEffect(() => {
		const fetchStats = async (currentPage = 1) => {
			try {
				setLoading(true);
				const response = await getMatchStats(id, {
					page: currentPage,
					limit: 5,
				});
				setStats(response.data.data || []);
				setMeta(response.data.meta);
			} catch (err) {
				console.error("Ошибка при загрузке статистики:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchStats(page);
	}, [id, page]);

	const chartData = [...stats].reverse().map((item) => ({
		date: isoToRuDate(item.match.matchDate).split(" ")[0],
		dateStr: isoToRuDate(item.match.matchDate),
		opponent: item.match.opponentName,
		Points: item.goals + item.assists,
		Goals: item.goals,
		Assists: item.assists,
	}));
	const CustomTooltip = ({ active, payload }) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="chart-tooltip">
					<p className="chart-tooltip__opponent">{data.opponent}</p>
					<p className="chart-tooltip__date">{data.dateStr}</p>
					<div className="chart-tooltip__divider"></div>
					<p className="chart-tooltip__stat chart-tooltip__stat--main">
						Очки: {data.Points}
					</p>
					<p className="chart-tooltip__stat">Голы: {data.Goals}</p>
					<p className="chart-tooltip__stat">
						Передачи: {data.Assists}
					</p>
				</div>
			);
		}
		return null;
	};

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
			{!loading && meta && (
				<div className="players-page__pagination">
					<Pagination meta={meta} onPageChange={handlePageChange} />
				</div>
			)}
			{chartData.length > 0 && (
				<div className="player-matches__chart-container dashboard-card">
					<h3 className="dashboard-card__title">
						Динамика набранных очков
					</h3>
					<div className="player-matches__chart-wrapper">
						<ResponsiveContainer width="100%" height={300}>
							<LineChart
								data={chartData}
								margin={{
									top: 10,
									right: 15,
									left: -20,
									bottom: 0,
								}}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#222222"
									opacity={0.15}
								/>

								<XAxis
									dataKey="date"
									tick={{
										fill: "#222222",
										fontWeight: 700,
										fontSize: 11,
									}}
									stroke="#222222"
								/>

								<YAxis
									dataKey="Points"
									allowDecimals={false}
									tick={{ fill: "#222222", fontWeight: 700 }}
									stroke="#222222"
								/>

								<Tooltip content={<CustomTooltip />} />

								<Line
									type="linear"
									dataKey="Points"
									stroke="#222222"
									strokeWidth={4}
									dot={{
										stroke: "#222222",
										strokeWidth: 2,
										r: 5,
										fill: "#fff",
									}}
									activeDot={{
										stroke: "#222222",
										strokeWidth: 3,
										r: 8,
										fill: "#ff4757",
									}}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>
			)}
		</div>
	);
}
