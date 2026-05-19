import React, { useEffect, useState } from "react";
import { getAuditLogs } from "../../services/api";
import "./LogsPage.css";
import Loader from "../../components/layout/Loader/Loader";
import ErrorPage from "../Error/ErrorPage";
import Pagination from "../../components/layout/Pagination/Pagination";

export default function LogsPage() {
	const [logs, setLogs] = useState([]);
	const [page, setPage] = useState(1);
	const [meta, setMeta] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadLogs(page);
	}, [page]);

	const loadLogs = async (currentPage = 1) => {
		setLoading(true);
		try {
			const res = await getAuditLogs(currentPage);
			setLogs(res.data.data);
			setMeta(res.data.meta);
		} catch (err) {
			setError(err.response?.data);
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString("ru-RU", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handlePageChange = (newPage) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};
	if (loading) return <Loader />;

	if (error) return <ErrorPage error={error} />;

	return (
		<div className="logs container">
			<header className="logs__header">
				<h1 className="logs__title">Журнал аудита</h1>
			</header>

			<div className="logs__table-container">
				<table className="logs__table">
					<thead>
						<tr>
							<th>Дата и время</th>
							<th>Пользователь</th>
							<th>Действие</th>
							<th>Сущность</th>
							<th>Изменения</th>
						</tr>
					</thead>
					<tbody>
						{logs.map((log) => (
							<tr key={log.id} className="logs__row">
								<td className="logs__cell logs__cell--date">
									{formatDate(log.timestamp)}
								</td>
								<td className="logs__cell">
									<div className="logs__user">
										<strong>
											{log.user?.fullName || "Система"}
										</strong>
										<span>{log.user?.email}</span>
									</div>
								</td>
								<td className="logs__cell">
									<span
										className={`logs__badge logs__badge--${log.action.toLowerCase()}`}
									>
										{log.action}
									</span>
								</td>
								<td className="logs__cell">
									<span className="logs__entity">
										{log.entityType}
									</span>
									<small>ID: {log.entityId}</small>
								</td>
								<td className="logs__cell logs__cell--changes">
									<div className="logs__diff">
										<div className="logs__diff-item logs__diff-item--old">
											<span className="logs__diff-label">
												Было:
											</span>
											<pre>
												{JSON.stringify(
													log.oldValues,
													null,
													2,
												)}
											</pre>
										</div>
										<div className="logs__diff-item logs__diff-item--new">
											<span className="logs__diff-label">
												Стало:
											</span>
											<pre>
												{JSON.stringify(
													log.newValues,
													null,
													2,
												)}
											</pre>
										</div>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{!loading && meta && (
				<div className="players-page__pagination">
					<Pagination meta={meta} onPageChange={handlePageChange} />
				</div>
			)}
		</div>
	);
}
