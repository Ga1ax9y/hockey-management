import './Pagination.css';

export default function Pagination({ meta, onPageChange }) {
  const { page, totalPages, hasNextPage, hasPrevPage } = meta;

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination">
      <button
        className={`pagination__arrow ${!hasPrevPage ? 'pagination__arrow--disabled' : ''}`}
        onClick={() => hasPrevPage && onPageChange(page - 1)}
        disabled={!hasPrevPage}
      >
        « НАЗАД
      </button>

      <div className="pagination__list">
        {pages.map((p) => (
          <button
            key={p}
            className={`pagination__item ${p === page ? 'pagination__item--active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {String(p).padStart(2, '0')}
          </button>
        ))}
      </div>

      <button
        className={`pagination__arrow ${!hasNextPage ? 'pagination__arrow--disabled' : ''}`}
        onClick={() => hasNextPage && onPageChange(page + 1)}
        disabled={!hasNextPage}
      >
        ВПЕРЕД »
      </button>
    </nav>
  );
}
