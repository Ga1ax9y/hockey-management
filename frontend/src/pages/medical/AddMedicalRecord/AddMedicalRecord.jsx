import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addMedicalRecord, getMedicalRecords } from "../../../services/api";
import { useForm } from "react-hook-form";
import { MEDICAL_STATUS, getMedicalLabel } from "../../../utils/dicts";
import { useRole } from "../../../hooks/useRole";
export default function AddMedicalRecord() {
	const { id } = useParams();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [medicalRecords, setMedicalRecords] = useState([]);
	const { isAdmin, isDoctor } = useRole();
	const { register, handleSubmit, reset } = useForm({
		defaultValues: {
			injuryDate: new Date().toISOString().split("T")[0],
			recoveryDate: "",
			diagnosis: "",
			status: "",
		},
	});

	const onSubmit = async (data) => {
		setIsSubmitting(true);
		try {
			await addMedicalRecord(id, {
				injuryDate: data.injuryDate,
				recoveryDate: data.recoveryDate,
				diagnosis: data.diagnosis,
				status: data.status,
			});
			console.log(data)
			reset();
			loadMedicalRecords();
		} catch (err) {
			alert("Ошибка: " + (err.response?.data?.error || err.message));
		} finally {
			setIsSubmitting(false);
		}
	};

	const loadMedicalRecords = useCallback(async () => {
		try {
			const res = await getMedicalRecords(id);
			setMedicalRecords(res.data.data);
		} catch (err) {
			console.error(err);
		}
	}, [id]);

	useEffect(() => {
		loadMedicalRecords();
	}, [loadMedicalRecords]);

	return (
		<div className="events-page">
			<header className="events-page__header">
				<h1 className="events-page__title">Медицинская история</h1>
			</header>

			{(isAdmin || isDoctor) && (
					<section className="medical-record__form form-block">
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="medical-record__field form-block__field">
								<label className="medical-record__label form-block__label">
									Дата повреждения
								</label>
								<input
									type="date"
									className="medical-record__input form-block__input"
									{...register("injuryDate", {
										required: true,
									})}
								/>
							</div>
							<div className="medical-record__field form-block__field">
								<label className="medical-record__label form-block__label">
									Прогнозируемая дата восстановления
								</label>
								<input
									type="date"
									className="medical-record__input form-block__input"
									{...register("recoveryDate", {
										required: true,
									})}
								/>
							</div>
							<div className="medical-record__field form-block__field">
								<label className="medical-record__label form-block__label">
									Статус
								</label>
								<select
									className="medical-record__input form-block__input"
									{...register("status", {
										required: true,
									})}
								>
									<option value="" disabled selected>
										Выберите тип
									</option>
									{MEDICAL_STATUS.map((t) => (
										<option key={t.value} value={t.value}>
											{t.label}
										</option>
									))}
								</select>
							</div>

							<div className="medical-record__field form-block__field">
								<label className="medical-record__label form-block__label">
									Диагноз
								</label>
								<textarea
									className="medical-record__textarea form-block__textarea"
									{...register("diagnosis", {
										required: true,
									})}
								></textarea>
							</div>
							<button
								type="submit"
								className="medical-record__submit form-block__submit"
								disabled={isSubmitting}
							>
								{isSubmitting
									? "Загрузка..."
									: "Добавить запись"}
							</button>
						</form>
					</section>
				)}
			<section className="medical-record__list-section">
				<h2 className="events-page__section-title">
					История повреждений
				</h2>

				<div className="events-page__list">
					{medicalRecords.length > 0 ? (
						medicalRecords.map((record) => (
							<div
								key={record.id}
								className="medical-record__card event-card"
							>
								<div className="event-card__side-indicator"></div>
								<div className="event-card__content">
									<div className="event-card__meta">
										<span className="event-card__type">
											{getMedicalLabel(record.status)}
										</span>
										<span className="event-card__time">
											{new Date(
												record.injuryDate,
											).toLocaleDateString("ru-RU")}
											-
											{new Date(
												record.recoveryDate,
											).toLocaleDateString("ru-RU")}
										</span>
									</div>

									<h3 className="event-card__title">
										{record.diagnosis}{" "}
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
