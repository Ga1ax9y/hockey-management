import { useAuthStore } from "../../hooks/useAuthStore";
import { Link } from "react-router-dom";
import "./Home.css";
import Loader from "../../components/layout/Loader/Loader";
import { useRole } from "../../hooks/useRole";
import { isoToRuDate } from "../../utils/date";

export default function Home() {
	const user = useAuthStore((state) => state.user);
	const isLoading = useAuthStore((state) => state.isLoading);
	const { isCoach, isManager, isAdmin, isAnalyst } = useRole();

	if (isLoading) return <Loader />;
	if (!user) return null;

	return (
		<div className="home container">
			<header className="home__header">
				<h1 className="home__title">
					Добро пожаловать, {user.fullName}!
				</h1>
				<div className="home__meta">
					<span className="home__meta-item home__meta-item--role">
						Роль: {user.role?.name}
					</span>
					<span className="home__meta-item">Email: {user.email}</span>
				</div>
			</header>

			<div className="home__grid">
				<section className="home__card dashboard-card">
					<h3 className="dashboard-card__title">
						{isAdmin || isManager
							? "Управление командами"
							: "Ваши команды"}
					</h3>

					{isAdmin || isManager ? (
						<div className="dashboard-card__admin-access">
							<p className="dashboard-card__text">
								Вам доступно управление всеми командами
								организации.
							</p>
							<Link
								to="/management/teams"
								className="dashboard-card__action-btn"
							>
								Перейти к списку команд
							</Link>
						</div>
					) : (
						<>
							{user.teams?.length === 0 ? (
								<p className="dashboard-card__empty">
									Вы не привязаны ни к одной команде.
								</p>
							) : (
								<ul className="dashboard-card__list">
									{user.teams.map((ut) => (
										<li
											key={ut.id}
											className="dashboard-card__item"
										>
											<Link
												to={`/management/teams/${ut.id}`}
												className="dashboard-card__link"
											>
												<span className="dashboard-card__link-text">
													{ut.name}
												</span>
												<span className="dashboard-card__tag">
													{ut.league || "—"}
												</span>
											</Link>
										</li>
									))}
								</ul>
							)}
						</>
					)}
				</section>

				<section className="home__card dashboard-card">
					<h3 className="dashboard-card__title">Быстрый доступ</h3>
					<ul className="dashboard-card__list dashboard-card__list--quick">
						{isAdmin && (
							<li className="dashboard-card__item">
								<Link
									to="/management"
									className="dashboard-card__action-btn"
								>
									Панель управления
								</Link>
							</li>
						)}
						{isCoach && (
							<li className="dashboard-card__item">
								<Link
									to="/events"
									className="dashboard-card__action-btn"
								>
									События
								</Link>
							</li>
						)}
						{isAdmin && (
							<li className="dashboard-card__item">
								<Link
									to="/management/logs"
									className="dashboard-card__action-btn"
								>
									Логи
								</Link>
							</li>
						)}
						{isManager && (
							<>
								<li className="dashboard-card__item">
									<Link
										to="/management/teams"
										className="dashboard-card__action-btn"
									>
										Иерархия команд
									</Link>
								</li>
								<li className="dashboard-card__item">
									<Link
										to="/management/users"
										className="dashboard-card__action-btn"
									>
										Пользователи
									</Link>
								</li>
							</>
						)}
						{isAnalyst && (
							<li className="dashboard-card__item">
								<Link
									to="/management/analytics"
									className="dashboard-card__action-btn"
								>
									Аналитика
								</Link>
							</li>
						)}
					</ul>
				</section>
			</div>

			<footer className="home__footer">
				<span className="home__footer-text">
					Дата регистрации: {isoToRuDate(user.createdAt)}
				</span>
			</footer>
		</div>
	);
}
