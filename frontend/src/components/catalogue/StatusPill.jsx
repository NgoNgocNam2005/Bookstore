function StatusPill({ status }) {
  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    borrowed: 'Borrowed',
    returned: 'Returned',
    rejected: 'Rejected',
    cancelled: 'Cancelled'
  };

  return <span className={`status-pill status-${status}`}>{labels[status] || status}</span>;
}

export default StatusPill;
