import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
	getSchedule,
	getTeams,
	getTeamById,
	createMatch,
	createTraining,
} from "../../../services/api";
import { useAuthStore } from "../../../hooks/useAuthStore";
import { formatDateTimeToRU, inputDateTimeToISO } from "../../../utils/date";
import "./Events.css";
import { useRole } from "../../../hooks/useRole";
import {
	MATCH_TYPES,
	SEASON_TYPES,
	TRAINING_TYPES,
	getTrainingStatusLabel,
} from "../../../utils/dicts";
import Loader from "../../../components/layout/Loader/Loader";
import { Link } from "react-router-dom";
import Pagination from "../../../components/layout/Pagination/Pagination";

export default function Events() {
	const { user } = useAuthStore();
	const { isCoach } = useRole();

	const [events, setEvents] = useState([]);
	const [teams, setTeams] = useState([]);
	const [page, setPage] = useState(1);
	const [meta, setMeta] = useState(null);
	const [coaches, setCoaches] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);

	const [viewTeamId, setViewTeamId] = useState("");

	const { register, handleSubmit, watch, reset, setValue } = useForm({
		defaultValues: {
			eventType: "TRAINING",
			isHomeGame: "true",
			teamId: "",
			coachId: "",
		},
	});

	const eventType = watch("eventType");
	const createTeamId = watch("teamId");

	useEffect(() => {
		if (!user) return;
		const initTeams = async () => {
			try {
				const teamsRes = await getTeams();
				let availableTeams;
				if (isCoach) {
					availableTeams = user.teams;
				} else {
					availableTeams = teamsRes.data?.data || [];
				}

				setTeams(availableTeams);
				if (availableTeams.length > 0) {
					const defaultId = availableTeams[0].id;
					setViewTeamId(defaultId.toString());
				}
			} catch (err) {
				console.error("Ошибка загрузки команд:", err);
			} finally {
				setLoading(false);
			}
		};
		initTeams();
	}, [user, isCoach]);

	const loadSchedule = useCallback(
		async (currentPage = 1) => {
			if (!viewTeamId) return;
			setLoading(true);
			try {
				const scheduleRes = await getSchedule(viewTeamId, {
					page: currentPage,
				});
				setEvents(scheduleRes.data?.data || []);
				setMeta(scheduleRes.data.meta);
			} catch (err) {
				console.error("Ошибка загрузки расписания:", err);
			} finally {
				setLoading(false);
			}
		},
		[viewTeamId],
	);
	const handlePageChange = (newPage) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	useEffect(() => {
		loadSchedule(page);
	}, [loadSchedule, page]);

	const loadCoaches = useCallback(async (teamId) => {
		if (!teamId) {
			setCoaches([]);
			return;
		}
		try {
			const res = await getTeamById(teamId, { includeUsers: true });
			const teamData = res.data?.data || res.data || {};

			const teamUsers =
				teamData.users?.map((ut) => ut.user).filter(Boolean) || [];
			const teamCoaches = teamUsers.filter(
				(u) => u.role?.code === "COACH",
			);
			setCoaches(teamCoaches);
		} catch (err) {
			console.error("Ошибка загрузки тренеров:", err);
			setCoaches([]);
		}
	}, []);

	useEffect(() => {
		if (createTeamId) {
			loadCoaches(createTeamId);
		}
	}, [createTeamId, loadCoaches]);

	useEffect(() => {
		if (showForm && isCoach && user?.id) {
			setValue("coachId", user.id.toString());
		}
	}, [showForm, isCoach, user, setValue]);

	const onSubmit = async (data) => {
		try {
			if (data.eventType === "MATCH") {
				await createMatch({
					matchDate: inputDateTimeToISO(data.startTime),
					location: data.location,
					myTeamId: Number(data.teamId),
					opponentName: data.opponentName,
					matchType: data.matchType,
					season: data.season,
					isHomeGame: data.isHomeGame === "true",
				});
			} else {
				await createTraining({
					startTime: inputDateTimeToISO(data.startTime),
					endTime: inputDateTimeToISO(data.endTime),
					location: data.location,
					teamId: Number(data.teamId),
					trainingType: data.trainingType,
					coachId: Number(data.coachId),
				});
			}
			setViewTeamId(data.teamId);
			reset();
			setShowForm(false);
			loadSchedule();
		} catch (err) {
			alert("Ошибка при сохранении", err);
		}
	};

	const { upcoming, past } = useMemo(() => {
		const now = new Date();

		const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

		const sorted = [...events].sort(
			(a, b) => new Date(a.start) - new Date(b.start),
		);

		return {
			upcoming: sorted.filter((e) => new Date(e.start) >= twoHoursAgo),
			past: sorted
				.filter((e) => new Date(e.start) < twoHoursAgo)
				.reverse(),
		};
	}, [events]);

	return (
		<div className="events-page container">
			<header className="events-page__header">
				<div className="events-page__top-bar">
					<h1 className="events-page__title">Расписание событий</h1>
					<button
						className={`events-page__add-btn ${showForm ? "events-page__add-btn--active" : ""}`}
						onClick={() => {
							setShowForm(!showForm);
							reset();
						}}
					>
						{showForm ? "ОТМЕНИТЬ" : "ДОБАВИТЬ СОБЫТИЕ"}
					</button>
				</div>

				<div className="events-page__filter-panel">
					<div className="events-page__selector">
						<label className="events-page__label">
							Фильтр по команде:
						</label>
						<select
							className="events-page__select"
							value={viewTeamId}
							onChange={(e) => setViewTeamId(e.target.value)}
						>
							{teams.map((t) => (
								<option key={t.id} value={t.id}>
									{t.name}
								</option>
							))}
						</select>
					</div>
				</div>
			</header>

			{showForm && (
				<section className="events-page__form-section">
					<form
						className="events-page__form form-block"
						onSubmit={handleSubmit(onSubmit)}
					>
						<div className="form-block__field">
							<label className="form-block__label">
								Тип события
							</label>
							<select
								className="form-block__select"
								{...register("eventType")}
							>
								<option value="TRAINING">Тренировка</option>
								<option value="MATCH">Матч</option>
							</select>
						</div>

						<div className="form-block__row">
							<div className="form-block__field">
								<label className="form-block__label">
									Начало
								</label>
								<input
									type="datetime-local"
									className="form-block__input"
									{...register("startTime", {
										required: true,
									})}
								/>
							</div>
							{eventType === "TRAINING" && (
								<div className="form-block__field">
									<label className="form-block__label">
										Конец
									</label>
									<input
										type="datetime-local"
										className="form-block__input"
										{...register("endTime")}
									/>
								</div>
							)}
						</div>

						<div className="form-block__row">
							<div className="form-block__field">
								<label className="form-block__label">
									Команда
								</label>
								<select
									className="form-block__select"
									{...register("teamId", { required: true })}
								>
									<option value="">Выберите...</option>
									{teams.map((t) => (
										<option key={t.id} value={t.id}>
											{t.name}
										</option>
									))}
								</select>
							</div>
							<div className="form-block__field">
								<label className="form-block__label">
									Локация
								</label>
								<input
									className="form-block__input"
									{...register("location", {
										required: true,
									})}
								/>
							</div>
						</div>

						{eventType === "MATCH" ? (
							<>
								<div className="form-block__row">
									<div className="form-block__field">
										<label className="form-block__label">
											Место
										</label>
										<select
											className="form-block__select"
											{...register("isHomeGame")}
										>
											<option value="true">Дома</option>
											<option value="false">Выезд</option>
										</select>
									</div>
									<div className="form-block__field">
										<label className="form-block__label">
											Соперник
										</label>
										<input
											className="form-block__input"
											{...register("opponentName", {
												required: true,
											})}
										/>
									</div>
								</div>
								<div className="form-block__row">
									<div className="form-block__field">
										<label className="form-block__label">
											Тип
										</label>
										<select
											className="form-block__input"
											placeholder="Тип (Лед, Зал)"
											{...register("matchType", {
												required: true,
											})}
										>
											{MATCH_TYPES.map((t) => (
												<option
													key={t.value}
													value={t.value}
												>
													{t.label}
												</option>
											))}
										</select>
									</div>
									<div className="form-block__field">
										<label className="form-block__label">
											Сезон
										</label>
										<select
											className="form-block__input"
											{...register("season", {
												required: true,
											})}
											defaultValue="2025/2026"
										>
											<option value="" disabled>
												Выберите сезон
											</option>
											{SEASON_TYPES.map((season) => (
												<option
													key={season}
													value={season}
												>
													{season}
												</option>
											))}
										</select>
									</div>
								</div>
							</>
						) : (
							<div className="form-block__row">
								<div className="form-block__field">
									<label className="form-block__label">
										Тип тренировки
									</label>
									<select
										className="form-block__select"
										{...register("trainingType", {
											required: true,
										})}
									>
										{TRAINING_TYPES.map((t) => (
											<option
												key={t.value}
												value={t.value}
											>
												{t.label}
											</option>
										))}
									</select>
								</div>
								<div className="form-block__field">
									<label className="form-block__label">
										Тренер
									</label>
									<select
										className="form-block__select"
										disabled={!createTeamId}
										{...register("coachId")}
									>
										<option value="">
											{createTeamId
												? "Выберите..."
												: "Сначала выберите команду"}
										</option>
										{coaches.map((c) => (
											<option key={c.id} value={c.id}>
												{c.fullName}
											</option>
										))}
									</select>
								</div>
							</div>
						)}

						<button type="submit" className="form-block__submit">
							СОЗДАТЬ ЗАПИСЬ
						</button>
					</form>
				</section>
			)}

			<div className="events-page__content">
				{loading ? (
					<Loader />
				) : (
					<div className="events-page__layout">
						<section className="events-page__column">
							<h2 className="events-page__section-title">
								Предстоящие
							</h2>
							<div className="events-page__list">
								{upcoming.length > 0 ? (
									upcoming.map((e) => (
										<EventCard key={e.id} event={e} />
									))
								) : (
									<p className="events-page__empty">
										Событий пока нет
									</p>
								)}
							</div>
						</section>

						<section className="events-page__column events-page__column--past">
							<h2 className="events-page__section-title">
								История
							</h2>
							<div className="events-page__list">
								{past.map((e) => (
									<EventCard key={e.id} event={e} />
								))}
							</div>
						</section>
					</div>
				)}
			</div>
			{!loading && meta && (
				<div className="players-page__pagination">
					<Pagination meta={meta} onPageChange={handlePageChange} />
				</div>
			)}
		</div>
	);
}

function EventCard({ event }) {
	const { location, score, opponentName, trainingType } = event.extendedProps;
	const isMatch = event.type === "MATCH";

	return (
		<article
			className={`event-card event-card--${event.type.toLowerCase()}`}
		>
			<div className="event-card__side-indicator"></div>
			<div className="event-card__body">
				<header className="event-card__header">
					<span className="event-card__badge">
						{isMatch ? "МАТЧ" : "ТРЕНИРОВКА"}
					</span>
					<time className="event-card__time">
						{formatDateTimeToRU(event.start)}
					</time>
				</header>

				<Link
					to={
						isMatch
							? `/matches/${event.id}`
							: `/trainings/${event.id}`
					}
					className="event-card__title-link"
				>
					<h3 className="event-card__title">
						{isMatch
							? `vs ${opponentName}`
							: getTrainingStatusLabel(trainingType)}
					</h3>
				</Link>

				<footer className="event-card__footer">
					<span className="event-card__info">📍 {location}</span>
					{isMatch && event.status === "finished" && (
						<span className="event-card__score">
							Финальный счет: {score}
						</span>
					)}
				</footer>
			</div>
		</article>
	);
}
