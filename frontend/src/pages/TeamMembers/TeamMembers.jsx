import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
	addTeamUser,
	removeTeamUser,
	getAllUsers,
	getTeamById,
} from "../../services/api";
import "./TeamMembers.css";
import { useRole } from "../../hooks/useRole";
import ErrorPage from "../Error/ErrorPage";
import Loader from "../../components/layout/Loader/Loader";
import { isoToRuDate } from "../../utils/date";

export default function TeamMembers() {
	const { id: teamId } = useParams();
	const [teamUsers, setTeamUsers] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	const [players, setPlayers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [selectedUserId, setSelectedUserId] = useState("");
	const { isAdmin, isManager } = useRole();

	const loadTeamData = async () => {
		try {
			setLoading(true);
			const playersRes = await getTeamById(teamId, {
				includePlayers: true,
				includeUsers: true,
			});
			const allUsersRes = await getAllUsers();
			const teamUsersRes = playersRes.data.users.map((ut) => ut?.user);

			setPlayers(playersRes.data.players);
			setTeamUsers(teamUsersRes);
			setAllUsers(
				allUsersRes.data.data.filter(
					(user) => !teamUsersRes.some((ut) => ut.id === user.id),
				),
			);
			setError("");
		} catch (err) {
			setTeamUsers([]);
			setPlayers([]);
			setError(
				err.response?.data || "Ошибка при загрузке данных состава",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTeamData();
	}, [teamId]);

	const handleAddUser = async () => {
		if (!selectedUserId) return;
		try {
			await addTeamUser(teamId, selectedUserId);
			loadTeamData();
			setSelectedUserId("");
		} catch (err) {
			setError(err.response?.data);
		}
	};

	const handleRemoveUser = async (userId) => {
		if (!confirm("Отвязать пользователя от команды?")) return;
		try {
			await removeTeamUser(teamId, userId);
			loadTeamData();
		} catch (err) {
			setError(err.response?.data);
		}
	};

	if (loading) return <Loader />;
	if (error) return <ErrorPage error={error} />;

	return (
		<div className="team-members container">
			<header className="team-members__header">
				<h2 className="team-members__title">
					Состав и персонал команды
				</h2>
			</header>

			<section className="team-members__section members-block">
				<h3 className="members-block__title">
					Административный и тренерский состав
				</h3>
				{teamUsers.length === 0 ? (
					<p className="team-members__empty">Персонал не закреплен</p>
				) : (
					<ul className="members-block__list">
						{teamUsers.map((user) => (
							<li
								key={user.id}
								className="members-block__item staff-card"
							>
								<div className="staff-card__info">
									<Link to={`/profile/${user.id}`} className="members-table__link">
										<span className="staff-card__name">
											{user.fullName}
										</span>
									</Link>
									<span className="staff-card__role">
										{user.role.name}
									</span>
									<span className="staff-card__email">
										{user.email}
									</span>
								</div>
								{(isAdmin || isManager) && (
									<button
										onClick={() =>
											handleRemoveUser(user.id)
										}
										className="staff-card__remove-btn"
									>
										ИСКЛЮЧИТЬ
									</button>
								)}
							</li>
						))}
					</ul>
				)}
			</section>

			{(isAdmin || isManager) && (
				<section className="team-members__section members-block">
					<h3 className="members-block__title">
						Назначить сотрудника
					</h3>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleAddUser();
						}}
						className="team-members__add-form form-block"
					>
						<div className="form-block__field">
							<label className="form-block__label">
								Выберите пользователя из системы
							</label>
							<select
								className="form-block__select"
								value={selectedUserId}
								onChange={(e) =>
									setSelectedUserId(e.target.value)
								}
								required
							>
								<option value="">— ВЫБРАТЬ —</option>
								{allUsers.map((user) => (
									<option key={user.id} value={user.id}>
										{user.fullName} ({user.role.name})
									</option>
								))}
							</select>
						</div>
						<button type="submit" className="form-block__submit">
							ПРИВЯЗАТЬ К КОМАНДЕ
						</button>
					</form>
				</section>
			)}

			<section className="team-members__section members-block">
				<h3 className="members-block__title">Действующие игроки</h3>
				{players.length === 0 ? (
					<p className="team-members__empty">
						В ростере команды нет игроков
					</p>
				) : (
					<div className="members-block__table-wrapper">
						<table className="members-table">
							<thead className="members-table__head">
								<tr className="members-table__row">
									<th className="members-table__th">Игрок</th>
									<th className="members-table__th">
										Позиция
									</th>
									<th className="members-table__th">Рост</th>
									<th className="members-table__th">Вес</th>
									<th className="members-table__th">
										Контракт
									</th>
								</tr>
							</thead>
							<tbody className="members-table__body">
								{players
									.sort((a, b) => {
										const order = {
											Вратарь: 1,
											Защитник: 2,
											Нападающий: 3,
										};
										return (
											(order[a.position] || 99) -
											(order[b.position] || 99)
										);
									})
									.map((player) => (
										<tr
											key={player.id}
											className="members-table__row"
										>
											<td className="members-table__td">
												<Link
													to={`/management/players/${player.id}`}
													className="members-table__link"
												>
													{player.lastName}{" "}
													{player.firstName}
												</Link>
											</td>
											<td className="members-table__td">
												<span
													className={`members-table__badge members-table__badge--${player.position === "Вратарь" ? "goalie" : "field"}`}
												>
													{player.position || "—"}
												</span>
											</td>
											<td className="members-table__td">
												{player.height || "—"} см
											</td>
											<td className="members-table__td">
												{player.weight || "—"} кг
											</td>
											<td className="members-table__td">
												{player.contractExpiry
													? isoToRuDate(
															player.contractExpiry,
														)
													: "—"}
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</div>
	);
}
