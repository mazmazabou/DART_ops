const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function Pagination({ page, pageSize, totalCount, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="ro-pagination">
      <div className="ro-pagination__left">
        <div className="ro-pagination__per-page">
          <span>Rows per page:</span>
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <span className="ro-pagination__info">
          <strong>{start}&ndash;{end}</strong> of <strong>{totalCount}</strong>
        </span>
      </div>
      <div className="ro-pagination__right">
        <button className="ro-pagination__btn" disabled={page <= 1} onClick={() => onPageChange(1)} title="First page">
          <i className="ti ti-chevrons-left" />
        </button>
        <button className="ro-pagination__btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)} title="Previous page">
          <i className="ti ti-chevron-left" />
        </button>
        <button className="ro-pagination__btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} title="Next page">
          <i className="ti ti-chevron-right" />
        </button>
        <button className="ro-pagination__btn" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)} title="Last page">
          <i className="ti ti-chevrons-right" />
        </button>
      </div>
    </div>
  );
}
