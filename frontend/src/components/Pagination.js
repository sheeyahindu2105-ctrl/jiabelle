import "../styles/admin.css";

function Pagination({ page, totalPages, onPrev, onNext }) {

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">

      <button
        disabled={page <= 1}
        onClick={onPrev}
      >
        ◀
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page >= totalPages}
        onClick={onNext}
      >
        ▶
      </button>

    </div>
  );
}

export default Pagination;