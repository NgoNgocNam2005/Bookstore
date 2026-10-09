import { useEffect, useState } from 'react';
import Modal from '../components/catalogue/Modal.jsx';
import Notice from '../components/catalogue/Notice.jsx';
import PageHeader from '../components/catalogue/PageHeader.jsx';
import Pagination from '../components/catalogue/Pagination.jsx';
import StatusPill from '../components/catalogue/StatusPill.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { apiRequest } from '../services/api.js';

const statusOptions = [
  ['pending', 'Pending'],
  ['approved', 'Approved'],
  ['borrowed', 'Borrowed'],
  ['returned', 'Returned'],
  ['rejected', 'Rejected'],
  ['cancelled', 'Cancelled']
];

const nextStatuses = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['borrowed', 'rejected', 'cancelled'],
  borrowed: ['returned'],
  returned: [],
  rejected: [],
  cancelled: []
};

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function getOrderBooks(order) {
  return order.items?.map((item) => item.book?.title).filter(Boolean).join(', ') || 'No books';
}

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

function BorrowOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSearchQuery(debouncedSearch.trim());
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);

      try {
        const result = await apiRequest(`/borrow-orders?${params.toString()}`, { token });
        if (!cancelled) {
          setOrders(result.items);
          setMeta(result.meta);
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();
    return () => { cancelled = true; };
  }, [page, reloadKey, searchQuery, statusFilter, token]);

  function commitSearch() {
    setSearchQuery(searchInput.trim());
    setPage(1);
  }

  function openStatusModal(order) {
    const options = nextStatuses[order.status] || [];
    setSelectedOrder(order);
    setNextStatus(options[0] || '');
    setAdminNote(order.adminNote || '');
    setDueAt(toDateTimeLocal(order.dueAt));
    setError('');
    setMessage('');
  }

  function closeStatusModal() {
    setSelectedOrder(null);
    setNextStatus('');
    setAdminNote('');
    setDueAt('');
  }

  async function handleStatusSubmit(event) {
    event.preventDefault();
    if (!selectedOrder || !nextStatus) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await apiRequest(`/borrow-orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        token,
        body: {
          status: nextStatus,
          adminNote: adminNote || null,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null
        }
      });
      closeStatusModal();
      setMessage(`Order ${selectedOrder.code} updated successfully.`);
      setPage(1);
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="content-grid">
      <PageHeader
        eyebrow="Library operations"
        title="Borrow orders."
        description="Review customer requests and keep the borrowing lifecycle up to date."
      />

      <Notice error={error} message={message} />

      <div className="card resource-list-card">
        <div className="resource-list-heading resource-list-toolbar">
          <div>
            <h3>All borrow orders</h3>
            <p className="muted">{meta.total} orders · search by order code or customer.</p>
          </div>
          <div className="book-filters">
            <input
              className="resource-search"
              placeholder="Search orders..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitSearch();
              }}
            />
            <select
              value={statusFilter}
              onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
            >
              <option value="">All statuses</option>
              {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading borrow orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">No borrow orders found.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Books</th>
                  <th>Created</th>
                  <th>Due date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium">{order.code}</td>
                    <td>
                      <strong>{order.customer?.fullName || order.customer?.username || 'Unknown'}</strong>
                      <small className="table-subtext">{order.customer?.email}</small>
                    </td>
                    <td className="order-books">{getOrderBooks(order)}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{formatDate(order.dueAt)}</td>
                    <td><StatusPill status={order.status} /></td>
                    <td className="text-right">
                      {(nextStatuses[order.status] || []).length > 0 && (
                        <button className="button button-ghost" onClick={() => openStatusModal(order)}>
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
          onPrevious={() => setPage((current) => current - 1)}
          onNext={() => setPage((current) => current + 1)}
        />
      </div>

      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={closeStatusModal}
        title="Update borrow order"
      >
        {selectedOrder && (
          <form className="modal-form" onSubmit={handleStatusSubmit}>
            <p className="muted order-modal-summary">
              {selectedOrder.code} · {selectedOrder.customer?.fullName || selectedOrder.customer?.email}
            </p>
            <div className="form-field">
              <label>Next status <span className="required">*</span></label>
              <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} required>
                {(nextStatuses[selectedOrder.status] || []).map((status) => (
                  <option key={status} value={status}>
                    {statusOptions.find(([value]) => value === status)?.[1] || status}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Due date</label>
              <input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
            </div>
            <div className="form-field">
              <label>Admin note</label>
              <textarea
                rows="4"
                maxLength="2000"
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Add an internal note..."
              />
            </div>
            <div className="form-actions">
              <button type="button" className="button-cancel" onClick={closeStatusModal}>Cancel</button>
              <button type="submit" className="button-save" disabled={saving || !nextStatus}>
                {saving ? 'Saving...' : 'Save status'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
}

export default BorrowOrdersPage;
