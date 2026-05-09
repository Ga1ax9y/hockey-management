import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTeamById, updateTeam, deleteTeam } from "../../services/api";
import "./TeamDetails.css";
import { useRole } from "../../hooks/useRole";
import Loader from "../../components/layout/Loader/Loader";
import ErrorPage from "../Error/ErrorPage";
import Schedule from "../../components/Schedule/Schedule";
export default function TeamDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [team, setTeam] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({
		name: "",
		league: "",
		level: 1,
		season: "",
	});
	const { isAdmin, isManager } = useRole();

	const loadTeam = async () => {
		try {
			setLoading(true);
			const res = await getTeamById(id);
			setTeam(res.data);
			setEditForm(res.data);
			setError("");
		} catch (err) {
			setError(err.response?.data || "Ошибка загрузки данных");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTeam();
	}, [id]);

	const handleUpdate = async (e) => {
		e.preventDefault();
		try {
			await updateTeam(id, editForm);
			setTeam(editForm);
			setIsEditing(false);
		} catch (err) {
			setError(err.response?.data || "Ошибка при обновлении");
		}
	};

	const handleDelete = async () => {
		if (!confirm("Вы уверены? Это действие нельзя отменить.")) return;
		try {
			await deleteTeam(id);
			navigate("/management/teams", { replace: true });
		} catch (err) {
			setError(err.response?.data || "Ошибка при удалении");
		}
	};

	if (loading) return <Loader />;
	if (error) return <ErrorPage error={error} />;
	if (!team) return null;

	return (
		<div className="team-details container">
			<header className="team-details__header">
				<h1 className="team-details__title">
					{isEditing
						? "Редактирование команды"
						: `Команда: ${team.name}`}
				</h1>
			</header>

			<div className="team-details__content">
				{isEditing ? (
					<form
						className="team-details__form form-block"
						onSubmit={handleUpdate}
					>
						<div className="team-details__field form-block__field">
							<label className="team-details__label form-block__label">
								Название команды *
							</label>
							<input
								type="text"
								className="team-details__input form-block__input"
								value={editForm.name}
								onChange={(e) =>
									setEditForm({
										...editForm,
										name: e.target.value,
									})
								}
								required
							/>
						</div>

						<div className="form-block__row">
							<div className="team-details__field form-block__field">
								<label className="team-details__label form-block__label">
									Лига
								</label>
								<input
									type="text"
									className="team-details__input form-block__input"
									value={editForm.league || ""}
									onChange={(e) =>
										setEditForm({
											...editForm,
											league: e.target.value,
										})
									}
								/>
							</div>
							<div className="team-details__field form-block__field">
								<label className="team-details__label form-block__label">
									Сезон *
								</label>
								<input
									type="text"
									className="team-details__input form-block__input"
									value={editForm.season}
									onChange={(e) =>
										setEditForm({
											...editForm,
											season: e.target.value,
										})
									}
									required
								/>
							</div>
						</div>

						<div className="team-details__field form-block__field">
							<label className="team-details__label form-block__label">
								Уровень *
							</label>
							<input
								type="number"
								className="team-details__input form-block__input"
								min="1"
								max="10"
								value={editForm.level}
								onChange={(e) =>
									setEditForm({
										...editForm,
										level: Number(e.target.value),
									})
								}
								required
							/>
						</div>

						<div className="team-details__form-actions">
							<button
								type="submit"
								className="team-details__submit form-block__submit"
							>
								Сохранить изменения
							</button>
							<button
								type="button"
								className="team-details__cancel form-block__secondary-btn"
								onClick={() => setIsEditing(false)}
							>
								Отмена
							</button>
						</div>
					</form>
				) : (
					<div className="team-details__card team-card">
						<div className="team-card__info">
							<div className="team-card__group">
								<span className="team-card__label">Лига</span>
								<span className="team-card__value team-card__value--accent">
									{team.league || "Вне лиги"}
								</span>
							</div>
							<div className="team-card__group">
								<span className="team-card__label">
									Уровень системы
								</span>
								<span className="team-card__value">
									{team.level}
								</span>
							</div>
							<div className="team-card__group">
								<span className="team-card__label">Сезон</span>
								<span className="team-card__value">
									{team.season}
								</span>
							</div>
						</div>

						<footer className="team-card__actions">
							<button
								className="team-card__btn team-card__btn--main"
								onClick={() => navigate(`/teams/${id}/members`)}
							>
								ПОСМОТРЕТЬ СОСТАВ
							</button>

							{(isAdmin || isManager) && (
								<div className="team-card__admin-zone">
									<button
										className="team-card__btn"
										onClick={() => setIsEditing(true)}
									>
										РЕДАКТИРОВАТЬ
									</button>
									<button
										className="team-card__btn team-card__btn--danger"
										onClick={handleDelete}
									>
										УДАЛИТЬ
									</button>
								</div>
							)}
						</footer>
					</div>
				)}
				<div className="team-schedule container">
					<h2>Расписание</h2>
					<Schedule teamId={team.id} />
				</div>
			</div>
		</div>
	);
}
