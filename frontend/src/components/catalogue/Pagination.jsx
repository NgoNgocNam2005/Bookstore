function Pagination({ page, totalPages, onPrevious, onNext, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <div className="pagination-pages">
        <button className="page-btn nav-btn" disabled={page <= 1} onClick={onPrevious}>
          &lt;
        </button>
        {pages.map(p => (
          <button 
            key={p} 
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange ? onPageChange(p) : (p < page ? onPrevious() : onNext())}
          >
            {p}
          </button>
        ))}
        <button className="page-btn nav-btn" disabled={page >= totalPages} onClick={onNext}>
          &gt;
        </button>
      </div>
      <div className="pagination-info">
        <select disabled className="page-size-select">
          <option>20 / page</option>
        </select>
      </div>
    </div>
  );
}

export default Pagination;
