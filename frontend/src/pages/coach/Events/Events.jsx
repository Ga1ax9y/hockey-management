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
} from "../../../utils/dicts";
import Loader from "../../../components/layout/Loader/Loader";
import { Link } from "react-router-dom";

export default function Events() {
	const { user } = useAuthStore();
	const { isCoach } = useRole();

	const [events, setEvents] = useState([]);
	const [teams, setTeams] = useState([]);
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

	const loadSchedule = useCallback(async () => {
		if (!viewTeamId) return;
		setLoading(true);
		try {
			const scheduleRes = await getSchedule(viewTeamId);
			setEvents(scheduleRes.data?.data || []);
		} catch (err) {
			console.error("Ошибка загрузки расписания:", err);
		} finally {
			setLoading(false);
		}
	}, [viewTeamId]);

	useEffect(() => {
		loadSchedule();
	}, [loadSchedule]);

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
		<div className="events-page">
			<header className="events-page__header">
				<div className="events-page__controls">
					<h1 className="events-page__title">Расписание событий</h1>

					<div className="events-page__team-selector">
						<label className="events-page__selector-label">
							Команда:
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

				<button
					className="events-page__add-btn"
					onClick={() => {
						setShowForm(!showForm);
						reset();
					}}
				>
					{showForm ? "Отмена" : "Добавить событие"}
				</button>
			</header>

			{showForm && (
				<form
					className="events-page__form event-form"
					onSubmit={handleSubmit(onSubmit)}
				>
					<div className="event-form__field">
						<label className="event-form__label">Тип события</label>
						<select
							className="event-form__input"
							{...register("eventType")}
						>
							<option value="TRAINING">Тренировка</option>
							<option value="MATCH">Матч</option>
						</select>
					</div>

					<div className="event-form__row">
						<div className="event-form__field">
							<label className="event-form__label">Начало</label>
							<input
								type="datetime-local"
								className="event-form__input"
								{...register("startTime", { required: true })}
							/>
						</div>
						{eventType === "TRAINING" && (
							<div className="event-form__field">
								<label className="event-form__label">
									Конец
								</label>
								<input
									type="datetime-local"
									className="event-form__input"
									{...register("endTime")}
								/>
							</div>
						)}
					</div>

					<div className="event-form__field">
						<label className="event-form__label">
							Для какой команды?
						</label>
						<select
							className="event-form__input"
							{...register("teamId", { required: true })}
						>
							<option value="">Выберите команду...</option>
							{teams.map((t) => (
								<option key={t.id} value={t.id}>
									{t.name}
								</option>
							))}
						</select>
					</div>

					<div className="event-form__field">
						<label className="event-form__label">Локация</label>
						<input
							className="event-form__input"
							{...register("location", { required: true })}
						/>
					</div>

					{eventType === "MATCH" ? (
						<div className="event-form__row">
							<select
								className="event-form__input"
								{...register("isHomeGame")}
							>
								<option value="true">Дома</option>
								<option value="false">Выезд</option>
							</select>
							<input
								className="event-form__input"
								placeholder="Соперник"
								{...register("opponentName", {
									required: true,
								})}
							/>
							<select
								className="event-form__input"
								placeholder="Тип (Лед, Зал)"
								{...register("matchType", {
									required: true,
								})}
							>
								{MATCH_TYPES.map((t) => (
									<option key={t.value} value={t.value}>
										{t.label}
									</option>
								))}
							</select>
							<select
								className="event-form__input"
								{...register("season", { required: true })}
								defaultValue="2025/2026"
							>
								<option value="" disabled>
									Выберите сезон
								</option>
								{SEASON_TYPES.map((season) => (
									<option key={season} value={season}>
										{season}
									</option>
								))}
							</select>
						</div>
					) : (
						<>
							<div className="event-form__field">
								<select
									className="event-form__input"
									placeholder="Тип (Лед, Зал)"
									{...register("trainingType", {
										required: true,
									})}
								>
									{TRAINING_TYPES.map((t) => (
										<option key={t.value} value={t.value}>
											{t.label}
										</option>
									))}
								</select>
							</div>
							<div className="event-form__field">
								<label className="event-form__label">
									Тренер
								</label>
								<select
									className="event-form__input"
									disabled={!createTeamId}
									{...register("coachId", {
										required: eventType === "TRAINING",
									})}
								>
									<option value="">
										{createTeamId
											? "Выберите тренера"
											: "Сначала выберите команду"}
									</option>
									{coaches.map((c) => (
										<option key={c.id} value={c.id}>
											{c.fullName} ({c.email})
										</option>
									))}
								</select>
							</div>
						</>
					)}

					<button type="submit" className="event-form__submit">
						Создать запись
					</button>
				</form>
			)}

			<main className="events-page__content">
				{loading ? (
					<Loader />
				) : (
					<>
						<section className="events-page__section">
							<h2 className="events-page__section-title">
								Предстоящие
							</h2>
							<div className="events-page__list">
								{upcoming.length > 0 ? (
									upcoming.map((e) => (
										<EventCard
											key={`${e.type}-${e.id}`}
											event={e}
										/>
									))
								) : (
									<p className="events-page__empty">
										Событий пока нет
									</p>
								)}
							</div>
						</section>

						<section className="events-page__section events-page__section--past">
							<h2 className="events-page__section-title">
								История
							</h2>
							<div className="events-page__list">
								{past.map((e) => (
									<EventCard
										key={`${e.type}-${e.id}`}
										event={e}
									/>
								))}
							</div>
						</section>
					</>
				)}
			</main>
		</div>
	);
}

function EventCard({ event }) {
	const { location, score, opponentName, trainingType } = event.extendedProps;
	const isMatch = event.type === "MATCH";

	return (
		<div className={`event-card event-card--${event.type.toLowerCase()}`}>
			<div className="event-card__side-indicator"></div>
			<div className="event-card__content">
				<div className="event-card__meta">
					<span className="event-card__type">
						{isMatch ? "МАТЧ" : "ТРЕНИРОВКА"}
					</span>
					<span className="event-card__time">
						{formatDateTimeToRU(event.start)}
					</span>
				</div>
				<Link
					to={
						isMatch
							? `/matches/${event.id}/stats`
							: `/trainings/${event.id}/stats`
					}
					className="btn"
				>
					<h3 className="event-card__title">
						{isMatch ? `vs ${opponentName}` : trainingType}
					</h3>
				</Link>
				<div className="event-card__details">
					<span className="event-card__location">📍 {location}</span>
					{isMatch && event.status === "finished" && (
						<span className="event-card__score">📊 {score}</span>
					)}
				</div>
			</div>
		</div>
	);
}
