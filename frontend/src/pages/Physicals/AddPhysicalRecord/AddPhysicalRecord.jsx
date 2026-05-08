import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addPhysicalRecord, getPhysicalRecords } from "../../../services/api";
import { useForm } from "react-hook-form";
import { METRIC_TYPES } from "../../../utils/dicts";
import { useRole } from "../../../hooks/useRole";
import "./AddPhysicalRecord.css";
import Pagination from "../../../components/layout/Pagination/Pagination";

export default function AddPhysicalRecord() {
	const { id } = useParams();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [physicalRecords, setPhysicalRecords] = useState([]);
	const [page, setPage] = useState(1);
	const [meta, setMeta] = useState(null);
	const { isAdmin, isCoach } = useRole();

	const { register, handleSubmit, reset } = useForm({
		defaultValues: {
			recordedDate: new Date().toISOString().split("T")[0],
			metricType: "",
			metricValue: "",
			unit: "",
		},
	});

	const handlePageChange = (newPage) => {
		setPage(newPage);
		window.scrollTo({ top: 500, behavior: "smooth" });
	};
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
			loadPhysicalRecords(page);
		} catch (err) {
			alert("Ошибка: " + (err.response?.data?.error || err.message));
		} finally {
			setIsSubmitting(false);
		}
	};

	const loadPhysicalRecords = useCallback(async (currentPage=1) => {
		try {
			const res = await getPhysicalRecords(id, { page: currentPage, limit: 5 });
			setPhysicalRecords(res.data.data);
			setMeta(res.data.meta);
		} catch (err) {
			console.error(err);
		}
	}, [id]);

	useEffect(() => {
		loadPhysicalRecords(page);
	}, [loadPhysicalRecords, page]);

	return (
		<div className="physical-page container">
			<header className="physical-page__header">
				<h1 className="physical-page__title">Физические показатели</h1>
			</header>
			{(isAdmin || isCoach) && (
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
							{isSubmitting ? "Загрузка..." : "Добавить запись"}
						</button>
					</form>
				</section>
			)}
			<section className="physical-page__list-section">
				<h2 className="physical-page__subtitle">История показателей</h2>

				<div className="physical-page__list">
					{physicalRecords.length > 0 ? (
						physicalRecords.map((record) => (
							<article key={record.id} className="metric-card">
								<div className="metric-card__side"></div>
								<div className="metric-card__content">
									<div className="metric-card__header">
										<span className="metric-card__type">
											{METRIC_TYPES.find(
												(t) =>
													t.value ===
													record.metricType,
											)?.label || record.metricType}
										</span>
										<time className="metric-card__date">
											{new Date(
												record.recordedDate,
											).toLocaleDateString("ru-RU")}
										</time>
									</div>

									<div className="metric-card__value-container">
										<span className="metric-card__value">
											{record.metricValue}
										</span>
										<span className="metric-card__unit">
											{record.unit}
										</span>
									</div>

									{record.player && (
										<div className="metric-card__footer">
											<span className="metric-card__player-name">
												{record.player.lastName}{" "}
												{record.player.firstName}
											</span>
											{record.player.currentTeam && (
												<span className="metric-card__team-tag">
													{
														record.player
															.currentTeam.name
													}
												</span>
											)}
										</div>
									)}
								</div>
							</article>
						))
					) : (
						<p className="physical-page__empty">Записей пока нет</p>
					)}
				</div>
			</section>
			{meta && (
				<div className="players-page__pagination">
					<Pagination meta={meta} onPageChange={handlePageChange} />
				</div>
			)}
		</div>
	);
}
