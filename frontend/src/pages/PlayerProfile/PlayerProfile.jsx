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
import {
	CONTRACT_TYPE,
	getContractTypeLabel,
	getMedicalLabel,
	TRANSFER_TYPE,
	getTransferTypeLabel,
	getMetricTypeLabel,
} from "../../utils/dicts";
import ErrorPage from "../Error/ErrorPage";
import { isoToRuDate } from "../../utils/date";

export default function PlayerProfile() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [player, setPlayer] = useState(null);
	const [matchStats, setMatchStats] = useState([]);
	const [trainingStats, setTrainingStats] = useState([]);
	const [careerHistory, setCareerHistory] = useState([]);
	const [medicalHistory, setMedicalHistory] = useState([]);
	const [physicals, setPhysicals] = useState([]);
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
					limit: 1,
				}),
				getTeams(),
			]);
			setPlayer(player.data);
			setMatchStats(player.data.matchStats);
			setTrainingStats(player.data.trainingStats);
			setCareerHistory(player.data.transfers);
			setMedicalHistory(player.data.medicalHistory);
			setPhysicals(player.data.physicalData);
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
		return (
			<div className="player-profile-loading">Загрузка профиля...</div>
		);
	if (error) return <ErrorPage error={error} />;
	if (!player) return null;

	return (
		<div className="player-profile">
			<button
				className="player-profile__back-btn"
				onClick={() => navigate(-1)}
			>
				← НАЗАД К СПИСКУ
			</button>

			<header className="player-profile__header">
				<div className="player-profile__avatar-container">
					<img
						src={player.photoUrl || "/default-avatar.png"}
						alt={player.lastName}
						className="player-profile__image"
					/>
				</div>

				<div className="player-profile__main-info">
					<h1 className="player-profile__name">
						{player.lastName} <br /> {player.firstName}
					</h1>
					<p className="player-profile__position">
						{player.position || "Позиция не указана"}
					</p>
					<div className="player-profile__stats-grid">
						<div className="player-profile__stat-item">
							<span className="player-profile__stat-label">
								КОМАНДА
							</span>
							<span className="player-profile__stat-value">
								{player.currentTeam.name || "—"}
							</span>
						</div>
						<div className="player-profile__stat-item">
							<span className="player-profile__stat-label">
								РОСТ
							</span>
							<span className="player-profile__stat-value">
								{player.height || "—"} СМ
							</span>
						</div>
						<div className="player-profile__stat-item">
							<span className="player-profile__stat-label">
								ВЕС
							</span>
							<span className="player-profile__stat-value">
								{player.weight || "—"} КГ
							</span>
						</div>
						<div className="player-profile__stat-item">
							<span className="player-profile__stat-label">
								КОНТРАКТ
							</span>
							<span className="player-profile__stat-value">
								{getContractTypeLabel(player.contractType) ||
									"—"}
							</span>
						</div>
					</div>
				</div>
			</header>

			<div className="player-profile__content">
				<section className="player-profile__section">
					<div className="player-profile__section-header">
						<h2 className="player-profile__section-title">
							ПОСЛЕДНИЙ МАТЧ
						</h2>
						<button
							className="player-profile__more-btn"
							onClick={() => navigate(`/players/${id}/matches`)}
						>
							ВСЕ МАТЧИ
						</button>
					</div>
					{matchStats.length > 0 ? (
						<div className="player-profile__card">
							<p>
								<strong>Соперник:</strong>{" "}
								{matchStats[0].match.opponentName}
							</p>
							<p>
								<strong>Результат:</strong> Г:
								{matchStats[0].goals} | П:
								{matchStats[0].assists} | +/-:
								{matchStats[0].plusMinus}
							</p>
						</div>
					) : (
						<p className="player-profile__empty">Нет данных</p>
					)}
				</section>
				<section className="player-profile__section">
					<div className="player-profile__section-header">
						<h2 className="player-profile__section-title">
							ПОСЛЕДНЯЯ ТРЕНИРОВКА
						</h2>
						<button
							className="player-profile__more-btn"
							onClick={() => navigate(`/players/${id}/trainings`)}
						>
							ВСЕ ТРЕНИРОВКИ
						</button>
					</div>
					{trainingStats.length > 0 ? (
						<div className="player-profile__card">
							<p>
								<strong>Тип:</strong>{" "}
								{trainingStats[0].training.trainingType}
							</p>
							<p>
								<strong>Оценка тренера:</strong>{" "}
								{trainingStats[0].coachRating}/10
							</p>
						</div>
					) : (
						<p className="player-profile__empty">Нет данных</p>
					)}
				</section>
				<section className="player-profile__section">
					<div className="player-profile__section-header">
						<h2 className="player-profile__section-title">
							ФИЗИЧЕСКИЕ ПОКАЗАТЕЛИ
						</h2>
						<button
							className="player-profile__more-btn"
							onClick={() => navigate(`/players/${id}/physicals`)}
						>
							ВСЕ ФИЗИЧЕСКИЕ ПОКАЗАТЕЛИ
						</button>
					</div>
					{physicals.length > 0 ? (
						<div className="player-profile__card">
							<p>
								<strong>Дата:</strong>{" "}
								{isoToRuDate(physicals[0].recordedDate)}
							</p>
							<p>
								<strong>
									{getMetricTypeLabel(
										physicals[0].metricType,
									)}
									:
								</strong>{" "}
								{physicals[0].metricValue || "—"}
								{physicals[0].unit || "—"}
							</p>
						</div>
					) : (
						<p className="player-profile__empty">Нет данных</p>
					)}
				</section>
				<section className="player-profile__section">
					<div className="player-profile__section-header">
						<h2 className="player-profile__section-title">
							МЕДИЦИНСКИЙ СТАТУС
						</h2>
						{(isDoctor || isAdmin) && (
							<button
								className="player-profile__more-btn"
								onClick={() =>
									navigate(`/players/${id}/medicals`)
								}
							>
								ИСТОРИЯ БОЛЕЗНЕЙ
							</button>
						)}
					</div>
					{medicalHistory.length > 0 ? (
						<div
							className={`player-profile__card player-profile__card--${medicalHistory[0].status}`}
						>
							<p>
								<strong>Дата повреждения:</strong>{" "}
								{isoToRuDate(medicalHistory[0].injuryDate)}
							</p>{" "}
							{medicalHistory[0].recoveryDate && (
								<p>
									<strong>
										Прогнозируемая дата восстановления:
									</strong>{" "}
									{isoToRuDate(
										medicalHistory[0].recoveryDate,
									)}
								</p>
							)}
							<p>
								<strong>Диагноз:</strong>{" "}
								{medicalHistory[0].diagnosis}
							</p>
							<p>
								<strong>Статус:</strong>{" "}
								{getMedicalLabel(medicalHistory[0].status)}
							</p>
							{medicalHistory[0].status !== "recovered" &&
								(isDoctor || isAdmin) && (
									<button
										className="player-profile__recover-btn"
										onClick={() =>
											handleRecover(medicalHistory[0].id)
										}
									>
										ИГРОК ВОССТАНОВИЛСЯ
									</button>
								)}
						</div>
					) : (
						<p className="player-profile__empty">
							Повреждений не было зафиксировано
						</p>
					)}
				</section>
				<section className="player-profile__section">
					<div className="player-profile__section-header">
						<h2 className="player-profile__section-title">
							ПОСЛЕДНИЙ ПЕРЕХОД
						</h2>
						<button
							className="player-profile__more-btn"
							onClick={() => navigate(`/players/${id}/transfers`)}
						>
							ВСЕ ТРАНСФЕРЫ
						</button>
					</div>
					{careerHistory.length > 0 ? (
						<div className="player-profile__card">
							<p>
								<strong>Дата:</strong>{" "}
								{isoToRuDate(careerHistory[0].transferDate)}
							</p>
							<p>
								<strong>Тип:</strong>{" "}
								{getTransferTypeLabel(
									careerHistory[0].transferType,
								)}
							</p>
							<p>
								<strong>Откуда:</strong>{" "}
								{careerHistory[0].fromTeam.name || "—"}
							</p>
							<p>
								<strong>Куда:</strong>{" "}
								{careerHistory[0].toTeam.name || "—"}
							</p>
						</div>
					) : (
						<p className="player-profile__empty">Нет данных</p>
					)}
				</section>
				{(isAdmin || isCoach) && (
					<section className="player-profile__section player-profile__section--admin">
						<div className="player-profile__section-header">
							<h2 className="player-profile__section-title">
								ТРАНСФЕРНОЕ УПРАВЛЕНИЕ
							</h2>
							<button
								className="player-profile__more-btn"
								onClick={() => navigate(`/manager/players`)}
							>
								КО ВСЕМ ИГРОКАМ
							</button>
						</div>
						<div
							className={`player-profile__transfer ${!isTransferAvailable ? "player-profile__transfer--disabled" : ""}`}
						>
							{isTransferAvailable ? (
								<div className="player-profile__transfer-form">
									<select
										className="player-profile__select"
										value={selectedTeam}
										onChange={(e) =>
											setSelectedTeam(e.target.value)
										}
									>
										<option value="" disabled>
											Выберите команду для перевода
										</option>
										{teams
											.filter(
												(t) =>
													t.id !==
													player.currentTeamId,
											)
											.map((team) => (
												<option
													key={team.id}
													value={team.id}
												>
													{team.name}
												</option>
											))}
									</select>
									<button
										className="player-profile__action-btn"
										onClick={handleTransfer}
										disabled={
											transferLoading || !selectedTeam
										}
									>
										ВЫПОЛНИТЬ ПЕРЕВОД
									</button>
								</div>
							) : (
								<p>Перевод недоступен по условиям контракта</p>
							)}
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
