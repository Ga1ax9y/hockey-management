import { useState, useEffect } from "react";
import {
	getTeams,
	getTeamStatus,
	previewIndex,
	createIndexRecord,
	updateTeamAnalytics,
} from "../../services/api";
import "./Analytics.css";
import { getConfidenceLevelLabel } from "../../utils/dicts";
import Loader from "../../components/layout/Loader/Loader";
import { isoToRuDate } from "../../utils/date";
export default function Analytics() {
	const [teams, setTeams] = useState([]);
	const [selectedTeam, setSelectedTeam] = useState(null);
	const [teamIndices, setTeamIndices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activePreview, setActivePreview] = useState(null);
	const [isProcessing, setIsProcessing] = useState(false);

	const READY_INDEX_LIMIT = 80;

	const handlePrintTeamReport = () => {
		if (!selectedTeam || teamIndices.length === 0) return;

		const printWindow = window.open("", "_blank");

		const tableRows = teamIndices
			.map((record) => {
				const isReady = record.readinessValue >= READY_INDEX_LIMIT;
				const statusColor = isReady ? "#2ed573" : "#000000";
				const statusWeight = isReady ? "900" : "500";

				return `
            <tr>
                <td>${record.player.lastName} ${record.player.firstName}</td>
                <td style="color: ${statusColor}; font-weight: ${statusWeight};">
                    ${record.readinessValue}
                </td>
                <td>${getConfidenceLevelLabel(record.confidenceLevel)}</td>
                <td>${new Date(record.createdAt).toLocaleDateString("ru-RU")}</td>
            </tr>
        `;
			})
			.join("");

		printWindow.document.write(`
        <html>
            <head>
                <title>Отчет по готовности: ${selectedTeam.name}</title>
                <style>
                    body { font-family: 'Inter', 'Segoe UI', sans-serif; padding: 30px; color: #000; }
                    .report { border: 4px solid #000; padding: 20px; position: relative; }
                    .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 4px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
                    .header__title { margin: 0; text-transform: uppercase; font-weight: 900; font-size: 28px; }
                    .header__meta { text-align: right; font-size: 12px; text-transform: uppercase; font-weight: 700; }

                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { text-align: left; text-transform: uppercase; font-size: 12px; padding: 10px; border-bottom: 2px solid #000; background: #f0f0f0; }
                    td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px; }

                    .summary { margin-top: 30px; padding: 15px; border: 2px solid #000; background: #fff; display: flex; gap: 40px; }
                    .summary__item { display: flex; flex-direction: column; }
                    .summary__label { font-size: 10px; text-transform: uppercase; color: #666; font-weight: 700; }
                    .summary__value { font-size: 20px; font-weight: 900; }

                    .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; text-transform: uppercase; font-weight: 700; }
                    .sig-line { border-top: 2px solid #000; width: 200px; margin-top: 30px; text-align: center; padding-top: 5px; }

                    @media print {
                        body { padding: 0; }
                        .report { border-width: 2px; }
                    }
                </style>
            </head>
            <body>
                <div class="report">
                    <div class="header">
                        <div>
                            <p style="margin: 0; font-size: 10px; font-weight: 800; text-transform: uppercase;">Система аналитики HMS</p>
                            <h1 class="header__title">${selectedTeam.name}</h1>
                        </div>
                        <div class="header__meta">
                            Дата формирования: ${isoToRuDate(new Date())}<br>
                            Тип документа: Отчет по готовности состава
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>ФИО Игрока</th>
                                <th>Индекс готовности</th>
                                <th>Достоверность</th>
                                <th>Дата замера</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>

                    <div class="summary">
                        <div class="summary__item">
                            <span class="summary__label">Всего игроков</span>
                            <span class="summary__value">${teamIndices.length}</span>
                        </div>
                        <div class="summary__item">
                            <span class="summary__label">Порог готовности</span>
                            <span class="summary__value">${READY_INDEX_LIMIT}</span>
                        </div>
                    </div>

                    <div class="footer">
                        <div>
                            <div class="sig-line">Главный тренер</div>
                        </div>
                        <div>
                            <div class="sig-line">Аналитик команды</div>
                        </div>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 100);
                    }
                </script>
            </body>
        </html>
    `);
		printWindow.document.close();
	};

	useEffect(() => {
		loadInitialData();
	}, []);

	const loadInitialData = async () => {
		try {
			const res = await getTeams();
			setTeams(res.data.data);
		} finally {
			setLoading(false);
		}
	};

	const handleSelectTeam = async (team) => {
		setSelectedTeam(team);
		setLoading(true);
		try {
			const res = await getTeamStatus(team.id);
			setTeamIndices(res.data.data);
			setActivePreview(null);
		} finally {
			setLoading(false);
		}
	};

	const handleRefreshTeam = async () => {
		if (!selectedTeam) return;
		setIsProcessing(true);
		try {
			await updateTeamAnalytics({ teamId: selectedTeam.id });
			handleSelectTeam(selectedTeam);
		} finally {
			setIsProcessing(false);
		}
	};

	const handlePreviewPlayer = async (playerId) => {
		setIsProcessing(true);
		try {
			const res = await previewIndex(playerId);
			setActivePreview({
				playerId,
				value: res.data.readinessValue,
				confidence: res.data.confidenceLevel,
			});
		} finally {
			setIsProcessing(false);
		}
	};

	const handleSaveIndex = async (playerId) => {
		try {
			await createIndexRecord({ playerId });
			handleSelectTeam(selectedTeam);
		} catch (err) {
			console.error(err);
		}
	};

	if (loading && !selectedTeam) return <Loader />;

	return (
		<div className="analytics container">
			<header className="analytics__header">
				<h1 className="analytics__title">Аналитика готовности</h1>
				<div className="analytics__controls">
					<button
						className="analytics__btn user-form__print-btn"
						onClick={handlePrintTeamReport}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							style={{ marginRight: "8px" }}
						>
							<path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
							<path d="M6 14h12v8H6z" />
						</svg>
                        Печать отчета
					</button>
					{selectedTeam && (
						<button
							className="analytics__refresh-btn"
							onClick={handleRefreshTeam}
							disabled={isProcessing}
						>
							{isProcessing
								? "Рассчитываем..."
								: "Обновить команду"}
						</button>
					)}
				</div>
			</header>

			<div className="analytics__grid">
				<aside className="analytics__sidebar">
					<h2 className="analytics__subtitle">Команды</h2>
					<ul className="team-selector">
						{teams.map((team) => (
							<li
								key={team.id}
								className={`team-selector__item ${selectedTeam?.id === team.id ? "team-selector__item--active" : ""}`}
								onClick={() => handleSelectTeam(team)}
							>
								<span className="team-selector__name">
									{team.name}
								</span>
								<span className="team-selector__arrow">→</span>
							</li>
						))}
					</ul>
				</aside>

				<div className="analytics__content">
					{selectedTeam ? (
						<>
							<h2 className="analytics__subtitle">
								Состав: {selectedTeam.name}
							</h2>
							<div className="players-grid">
								{teamIndices.map((record) => (
									<div
										key={record.id}
										className="player-card"
									>
										<div className="player-card__info">
											<h3 className="player-card__name">
												{record.player.lastName}{" "}
												{record.player.firstName}
											</h3>
											<div className="player-card__date">
												От:{" "}
												{isoToRuDate(record.createdAt)}
											</div>
											<div className="player-card__stats">
												<p className="player-card__status">
													Индекс:{" "}
													<span className="player-card__value">
														{record.readinessValue}
													</span>
												</p>
												<p className="player-card__confidence">
													Достоверность:{" "}
													{getConfidenceLevelLabel(
														record.confidenceLevel,
													)}
												</p>
											</div>
										</div>

										<div className="player-card__actions">
											<button
												className="analytics__btn analytics__btn--preview"
												onClick={() =>
													handlePreviewPlayer(
														record.player.id,
													)
												}
											>
												Рассчитать текущий
											</button>

											{activePreview?.playerId ===
												record.player.id && (
												<div className="player-card__preview-box">
													<div className="player-card__preview-data">
														<span className="player-card__preview-val">
															{
																activePreview.value
															}
														</span>
														<small>
															{
																activePreview.confidence
															}
														</small>
													</div>
													<button
														className="analytics__btn analytics__btn--save"
														onClick={() =>
															handleSaveIndex(
																record.player
																	.id,
															)
														}
													>
														Записать
													</button>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						</>
					) : (
						<div className="analytics__empty-state">
							Выберите команду
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
