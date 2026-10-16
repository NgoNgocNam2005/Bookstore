import { useEffect, useState } from 'react';
import Notice from '../components/catalogue/Notice.jsx';
import PageHeader from '../components/catalogue/PageHeader.jsx';
import Pagination from '../components/catalogue/Pagination.jsx';
import StatusPill from '../components/catalogue/StatusPill.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { apiRequest } from '../services/api.js';

function formatDate(value) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function getDaysOverdue(dueAt) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.max(
    1,
    Math.ceil((Date.now() - new Date(dueAt).getTime()) / millisecondsPerDay)
  );
}

function OverdueOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 1000);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSearchQuery(debouncedSearch.trim());
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    async function loadOverdueOrders() {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: String(page),
        limit: '10'
      });

      if (searchQuery) params.set('search', searchQuery);

      try {
        const result = await apiRequest(
          `/borrow-orders/overdue?${params.toString()}`,
          { token }
        );

        if (!cancelled) {
          setOrders(result.items || []);
          setMeta(result.meta || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          });
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOverdueOrders();

    return () => {
      cancelled = true;
    };
  }, [page, reloadKey, searchQuery, token]);

  function commitSearch() {
    setSearchQuery(searchInput.trim());
    setPage(1);
  }

  async function markAsReturned(order) {
    const confirmed = window.confirm(
      `Xác nhận đơn ${order.code} đã được trả sách?`
    );

    if (!confirmed) return;

    setSavingOrderId(order.id);
    setError('');
    setMessage('');

    try {
      await apiRequest(`/borrow-orders/${order.id}/status`, {
        method: 'PATCH',
        token,
        body: {
          status: 'returned',
          adminNote: order.adminNote || null
        }
      });

      setMessage(`Đơn ${order.code} đã được cập nhật thành Returned.`);
      setPage(1);
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingOrderId(null);
    }
  }

  return (
    <section className="content-grid">
      <PageHeader
        eyebrow="Library operations"
        title="Overdue returns."
        description="Theo dõi các đơn mượn đã quá hạn trả."
      />

      <Notice error={error} message={message} />

      <div className="card resource-list-card">
        <div className="resource-list-heading resource-list-toolbar">
          <div>
            <h3>Overdue borrow orders</h3>
            <p className="muted">{meta.total} đơn đã quá hạn.</p>
          </div>

          <input
            className="resource-search"
            placeholder="Tìm mã đơn hoặc khách hàng..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitSearch();
            }}
          />
        </div>

        {loading ? (
          <div className="empty-state">Đang tải đơn quá hạn...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">Không có đơn mượn quá hạn.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Sách</th>
                  <th>Hạn trả</th>
                  <th>Số ngày trễ</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const daysOverdue = getDaysOverdue(order.dueAt);

                  return (
                    <tr key={order.id}>
                      <td className="font-medium">{order.code}</td>
                      <td>
                        <strong>
                          {order.customer?.fullName ||
                            order.customer?.username ||
                            'Không rõ'}
                        </strong>
                        <small className="table-subtext">
                          {order.customer?.email}
                        </small>
                      </td>
                      <td className="order-books">
                        {order.items
                          ?.map((item) => item.book?.title)
                          .filter(Boolean)
                          .join(', ') || 'Không có sách'}
                      </td>
                      <td>{formatDate(order.dueAt)}</td>
                      <td>{daysOverdue} ngày</td>
                      <td><StatusPill status={order.status} /></td>
                      <td className="text-right">
                        <button
                          className="button button-primary"
                          disabled={savingOrderId === order.id}
                          onClick={() => markAsReturned(order)}
                        >
                          {savingOrderId === order.id
                            ? 'Đang lưu...'
                            : 'Xác nhận đã trả'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
    </section>
  );
}

export default OverdueOrdersPage;
