import { useState, useEffect, useCallback } from "react";
import {
	getPlayers,
	createPlayer,
	updatePlayer,
	deletePlayer,
	getTeams,
} from "../../../services/api";
import "./Players.css";
import { ruDateToISO, isoToRuDate } from "../../../utils/date";
import { Link } from "react-router-dom";
import Loader from "../../../components/layout/Loader/Loader";
import ErrorPage from "../../Error/ErrorPage";
import { CONTRACT_TYPE } from "../../../utils/dicts";
export default function Players() {
	const [players, setPlayers] = useState([]);
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [preview, setPreview] = useState(null);

	const [formData, setFormData] = useState({
		lastName: "",
		firstName: "",
		middleName: "",
		birthDate: "",
		position: "",
		height: "",
		weight: "",
		contractType: "",
		contractExpiry: "",
		currentTeamId: "",
		photo: null,
	});

	const loadData = useCallback(async () => {
		try {
			setLoading(true);
			const [playersRes, teamsRes] = await Promise.all([
				getPlayers({ includeCurrentTeam: true }),
				getTeams(),
			]);
			setPlayers(playersRes.data.data);
			setTeams(teamsRes.data.data);
		} catch (err) {
			setError(err.response?.data);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const resetForm = () => {
		setFormData({
			lastName: "",
			firstName: "",
			middleName: "",
			birthDate: "",
			position: "",
			height: "",
			weight: "",
			contractType: "",
			contractExpiry: "",
			currentTeamId: "",
			photo: null,
		});
		setPreview(null);
		setEditingId(null);
		setIsCreating(false);
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData({ ...formData, photo: file });
			setPreview(URL.createObjectURL(file));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");

		const data = new FormData();
		Object.keys(formData).forEach((key) => {
			if (key === "photo") {
				if (formData.photo) data.append("photo", formData.photo);
			} else if (key === "birthDate" || key === "contractExpiry") {
				data.append(key, ruDateToISO(formData[key]));
			} else {
				data.append(key, formData[key]);
			}
		});

		try {
			if (editingId) {
				await updatePlayer(editingId, data);
			} else {
				await createPlayer(data);
			}
			resetForm();
			loadData();
		} catch (err) {
			setError(err.response?.data);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (player) => {
		setFormData({
			lastName: player.lastName || "",
			firstName: player.firstName || "",
			middleName: player.middleName || "",
			birthDate: isoToRuDate(player.birthDate),
			position: player.position || "",
			height: player.height?.toString() || "",
			weight: player.weight?.toString() || "",
			contractType: player.contractType || "",
			contractExpiry: isoToRuDate(player.contractExpiry),
			currentTeamId: player.currentTeamId?.toString() || "",
			photo: null,
		});
		setPreview(player.photoUrl);
		setEditingId(player.id);
		setIsCreating(true);
	};

	if (loading) return <Loader />;

	if (error) return <div>{error}</div>;

	return (
		<div className="players-page container">
			<header className="players-page__header">
				<h1 className="players-page__title">Состав</h1>
				<button
					className={`players-page__toggle-btn ${isCreating ? "players-page__toggle-btn--cancel" : ""}`}
					onClick={() =>
						isCreating ? resetForm() : setIsCreating(true)
					}
          type="button"
				>
					{isCreating ? "Отмена" : "+ Добавить"}
				</button>
			</header>

			{isCreating && (
				<form
					className="players-page__form player-form"
					onSubmit={handleSubmit}
				>
					<div className="player-form__avatar-block">
						<div className="player-form__preview">
							{preview ? (
								<img src={preview} alt="Player" />
							) : (
								<span>ФОТО</span>
							)}
						</div>
						<label className="player-form__upload-label">
							Загрузить фото
							<input
								type="file"
								onChange={handleFileChange}
								hidden
								accept="image/*"
							/>
						</label>
					</div>

					<div className="player-form__fields">
						<div className="player-form__field">
							<label className="player-form__label">
								Фамилия
							</label>
							<input
								className="player-form__input"
								value={formData.lastName}
								onChange={(e) =>
									setFormData({
										...formData,
										lastName: e.target.value,
									})
								}
								required
							/>
						</div>

						<div className="player-form__field">
							<label className="player-form__label">Имя</label>
							<input
								className="player-form__input"
								value={formData.firstName}
								onChange={(e) =>
									setFormData({
										...formData,
										firstName: e.target.value,
									})
								}
								required
							/>
						</div>

						<div className="player-form__field">
							<label className="player-form__label">
								Отчество
							</label>
							<input
								className="player-form__input"
								value={formData.middleName}
								onChange={(e) =>
									setFormData({
										...formData,
										middleName: e.target.value,
									})
								}
							/>
						</div>

						<div className="player-form__field">
							<label className="player-form__label">
								Дата рождения
							</label>
							<input
								className="player-form__input"
								placeholder="ДД.ММ.ГГГГ"
								value={formData.birthDate}
								onChange={(e) =>
									setFormData({
										...formData,
										birthDate: e.target.value,
									})
								}
								required
							/>
						</div>

						<div className="player-form__field">
							<label className="player-form__label">
								Позиция
							</label>
							<select
								className="player-form__select"
								value={formData.position}
								onChange={(e) =>
									setFormData({
										...formData,
										position: e.target.value,
									})
								}
							>
								<option value="">Не указана</option>
								<option value="Вратарь">Вратарь</option>
								<option value="Защитник">Защитник</option>
								<option value="Нападающий">Нападающий</option>
							</select>
						</div>

						<div className="player-form__field-group">
							<div className="player-form__field">
								<label className="player-form__label">
									Рост (см)
								</label>
								<input
									type="number"
									className="player-form__input"
									value={formData.height}
									onChange={(e) =>
										setFormData({
											...formData,
											height: e.target.value,
										})
									}
								/>
							</div>
							<div className="player-form__field">
								<label className="player-form__label">
									Вес (кг)
								</label>
								<input
									type="number"
									className="player-form__input"
									value={formData.weight}
									onChange={(e) =>
										setFormData({
											...formData,
											weight: e.target.value,
										})
									}
								/>
							</div>
						</div>

						<div className="player-form__field">
							<label className="player-form__label">
								Команда
							</label>
							<select
								className="player-form__select"
								value={formData.currentTeamId}
								onChange={(e) =>
									setFormData({
										...formData,
										currentTeamId: e.target.value,
									})
								}
							>
								<option value="">Не выбрана</option>
								{teams.map((t) => (
									<option key={t.id} value={t.id}>
										{t.name}
									</option>
								))}
							</select>
						</div>

						<div className="player-form__field">
							<label className="player-form__label">
								Тип контракта
							</label>
							<select
								className="player-form__select"
								value={formData.contractType}
								onChange={(e) =>
									setFormData({
										...formData,
										contractType: e.target.value,
									})
								}
							>
								<option value="">Не указан</option>
								{CONTRACT_TYPE.map((type) => (
									<option key={type.value} value={type.value}>
										{type.label}
									</option>
								))}
							</select>
						</div>

						<div className="player-form__field">
							<label className="player-form__label">
								Окончание контракта
							</label>
							<input
								className="player-form__input"
								placeholder="ДД.ММ.ГГГГ"
								value={formData.contractExpiry}
								onChange={(e) =>
									setFormData({
										...formData,
										contractExpiry: e.target.value,
									})
								}
							/>
						</div>
					</div>

					<button
						className="player-form__submit-btn"
						type="submit"
						disabled={isSubmitting}
					>
						{isSubmitting
							? "..."
							: editingId
								? "Обновить"
								: "Создать"}
					</button>
				</form>
			)}

			<div className="players-page__table-container">
				<table className="players-table">
					<thead className="players-table__head">
						<tr className="players-table__row">
							<th className="players-table__th">Игрок</th>
							<th className="players-table__th players-table__th--desktop">
								Позиция
							</th>
							<th className="players-table__th">Действия</th>
						</tr>
					</thead>
					<tbody className="players-table__body">
						{players.map((player) => (
							<tr key={player.id} className="players-table__row">
								<td className="players-table__td">
									<div className="player-entity">
										<img
											className="player-entity__photo"
											src={
												player.photoUrl ||
												"/default-player.png"
											}
											alt=""
										/>
										<div className="player-entity__info">
											<Link
												to={`/players/${player.id}`}
												className="player-entity__name"
											>
												{player.lastName}{" "}
												{player.firstName}
											</Link>
											<span className="player-entity__team">
												{player.currentTeam?.name ||
													"Свободный агент"}
											</span>
										</div>
									</div>
								</td>
								<td className="players-table__td players-table__td--desktop">
									<span className="player-position-badge">
										{player.position || "—"}
									</span>
								</td>
								<td className="players-table__td">
									<div className="players-table__actions">
										<button
											onClick={() => handleEdit(player)}
											className="action-button action-button--edit"
                      type="button"
										>
											✎
										</button>
										<button
                    type="button"
											onClick={() =>
												deletePlayer(player.id).then(
													loadData,
												)
											}
											className="action-button action-button--delete"
										>
											✖
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
