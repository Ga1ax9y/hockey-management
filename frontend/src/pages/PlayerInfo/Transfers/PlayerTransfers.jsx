import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTransferTypeLabel } from "../../../utils/dicts";
import "./PlayerTransfers.css";
import { isoToRuDate } from "../../../utils/date";
import { getTransfers } from "../../../services/api";
import Loader from "../../../components/layout/Loader/Loader";
import Pagination from "../../../components/layout/Pagination/Pagination";

export default function PlayerTransfers() {
	const { id } = useParams();
	const [transfers, setTransfers] = useState([]);
	const [page, setPage] = useState(1);
	const [meta, setMeta] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTransfers = async (currentPage = 1) => {
			try {
				setLoading(true);
				const response = await getTransfers(id, {
					page: currentPage,
					limit: 5,
				});
				setTransfers(response.data?.data || []);
				setMeta(response.data.meta);
			} catch (err) {
				console.error("Ошибка при загрузке истории переходов:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchTransfers(page);
	}, [id, page]);
	const handlePageChange = (newPage) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};
	if (loading) return <Loader />;

	return (
		<div className="player-transfers container">
			<header className="player-transfers__header">
				<h1 className="player-transfers__title">ИСТОРИЯ ПЕРЕХОДОВ</h1>
			</header>

			<div className="player-transfers__content">
				{transfers.length === 0 ? (
					<div className="player-transfers__empty">
						<p className="player-transfers__empty-text">
							ИСТОРИЯ ПЕРЕХОДОВ ПУСТА
						</p>
						<p className="player-transfers__empty-sub">
							Игрок еще не менял команду
						</p>
					</div>
				) : (
					<div className="player-transfers__list">
						{transfers.map((item) => (
							<div
								key={item.id}
								className="player-transfers__item"
							>
								<div className="player-transfers__date-box">
									<span className="player-transfers__date">
										{isoToRuDate(item.transferDate)}
									</span>
									<span className="player-transfers__type-badge">
										{getTransferTypeLabel(
											item.transferType,
										) || "ПЕРЕВОД"}
									</span>
								</div>

								<div className="player-transfers__route">
									<div className="player-transfers__team player-transfers__team--from">
										<span className="player-transfers__label">
											ИЗ
										</span>
										<span className="player-transfers__team-name">
											{item.fromTeam?.name || "—"}
										</span>
									</div>

									<div className="player-transfers__arrow">
										→
									</div>

									<div className="player-transfers__team player-transfers__team--to">
										<span className="player-transfers__label">
											В
										</span>
										<span className="player-transfers__team-name">
											{item.toTeam?.name || "—"}
										</span>
									</div>
								</div>
							</div>
						))}
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
