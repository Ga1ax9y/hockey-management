import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addPhysicalRecord, getPhysicalRecords } from "../../../services/api";
import { useForm } from "react-hook-form";
import { METRIC_TYPES } from "../../../utils/dicts";
import { useRole } from "../../../hooks/useRole";

export default function AddPhysicalRecord() {
	const { id } = useParams();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [physicalRecords, setPhysicalRecords] = useState([]);
	const { isAdmin, isCoach } = useRole();

	const { register, handleSubmit, reset } = useForm({
		defaultValues: {
			recordedDate: new Date().toISOString().split("T")[0],
			metricType: "",
			metricValue: "",
			unit: "",
		},
	});

	const onSubmit = async (data) => {
		setIsSubmitting(true);
		try {
			await addPhysicalRecord(id, {
				recordedDate: data.recordedDate,
				metricType: data.metricType,
				metricValue: data.metricValue,
				unit: data.unit,
			});
			reset();
			loadPhysicalRecords();
		} catch (err) {
			alert("Ошибка: " + (err.response?.data?.error || err.message));
		} finally {
			setIsSubmitting(false);
		}
	};

	const loadPhysicalRecords = useCallback(async () => {
		try {
			const res = await getPhysicalRecords(id);
			setPhysicalRecords(res.data.data);
		} catch (err) {
			console.error(err);
		}
	}, [id]);

	useEffect(() => {
		loadPhysicalRecords();
	}, [loadPhysicalRecords]);

	return (
		<div className="events-page">
			<header className="events-page__header">
				<h1 className="events-page__title">Физические показатели</h1>
			</header>
			{
				((isAdmin || isCoach) && (
					<section className="physical-record__form form-block">
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="physical-record__field form-block__field">
								<label className="physical-record__label form-block__label">
									Дата замера
								</label>
								<input
									type="date"
									className="physical-record__input form-block__input"
									{...register("recordedDate", {
										required: true,
									})}
								/>
							</div>

							<div className="physical-record__field form-block__field">
								<label className="physical-record__label form-block__label">
									Тип показателя
								</label>
								<select
									className="physical-record__input form-block__input"
									{...register("metricType", {
										required: true,
									})}
								>
									<option value="" disabled selected>
										Выберите тип
									</option>
									{METRIC_TYPES.map((t) => (
										<option key={t.value} value={t.value}>
											{t.label}
										</option>
									))}
								</select>
							</div>

							<div className="physical-record__row form-block__row">
								<div className="physical-record__field form-block__field">
									<label className="physical-record__label form-block__label">
										Значение
									</label>
									<input
										type="number"
										step="0.1"
										className="physical-record__input form-block__input"
										{...register("metricValue", {
											required: true,
										})}
									/>
								</div>

								<div className="physical-record__field form-block__field">
									<label className="physical-record__label form-block__label">
										Ед. изм.
									</label>
									<input
										type="text"
										className="physical-record__input form-block__input"
										{...register("unit", {
											required: true,
										})}
									/>
								</div>
							</div>

							<button
								type="submit"
								className="physical-record__submit form-block__submit"
								disabled={isSubmitting}
							>
								{isSubmitting
									? "Загрузка..."
									: "Добавить запись"}
							</button>
						</form>
					</section>
				))}
			<section className="physical-record__list-section">
				<h2 className="events-page__section-title">
					История показателей
				</h2>

				<div className="events-page__list">
					{physicalRecords.length > 0 ? (
						physicalRecords.map((record) => (
							<div
								key={record.id}
								className="physical-record__card event-card"
							>
								<div className="event-card__side-indicator"></div>
								<div className="event-card__content">
									<div className="event-card__meta">
										<span className="event-card__type">
											{METRIC_TYPES.find(
												(t) =>
													t.value ===
													record.metricType,
											)?.label || record.metricType}
										</span>
										<span className="event-card__time">
											{new Date(
												record.recordedDate,
											).toLocaleDateString("ru-RU")}
										</span>
									</div>

									<h3 className="event-card__title">
										{record.metricValue}{" "}
										<span className="event-card__unit">
											{record.unit}
										</span>
									</h3>

									{record.player && (
										<div className="event-card__details">
											<span>
												{record.player.lastName}{" "}
												{record.player.firstName}
											</span>
											{record.player.currentTeam && (
												<span className="event-card__score">
													{
														record.player
															.currentTeam.name
													}
												</span>
											)}
										</div>
									)}
								</div>
							</div>
						))
					) : (
						<p className="events-page__label">Записей пока нет</p>
					)}
				</div>
			</section>
		</div>
	);
}
