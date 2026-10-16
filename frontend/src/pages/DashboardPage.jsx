import { useEffect, useState } from 'react';
import Notice from '../components/catalogue/Notice.jsx';
import PageHeader from '../components/catalogue/PageHeader.jsx';
import StatusPill from '../components/catalogue/StatusPill.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../services/api.js';

const dashboardCards = [
  { key: 'activeBooks', label: 'Active book titles', detail: 'Titles available in catalogue', icon: 'B' },
  { key: 'availableCopies', label: 'Available copies', detail: 'Ready to be borrowed', icon: 'A' },
  { key: 'pendingOrders', label: 'Pending requests', detail: 'Waiting for admin review', icon: 'P' },
  { key: 'borrowedCopies', label: 'Borrowed copies', detail: 'Currently with customers', icon: 'R' },
  { key: 'overdueOrders', label: 'Overdue orders', detail: 'Past their return date', icon: '!' }
];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function getCustomerName(order) {
  return order.customer?.fullName || order.customer?.username || order.customer?.email || 'Unknown customer';
}

function DashboardPage() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const result = await apiRequest('/dashboard/admin', { token });
        if (!cancelled) setDashboard(result.dashboard);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, [token]);

  const stats = dashboard?.stats || {};
  const recentOrders = dashboard?.recentOrders || [];

  return (
    <section className="content-grid dashboard-page">
      <PageHeader
        eyebrow="Library overview"
        title="Dashboard."
        description="A quick view of your catalogue, inventory and borrowing activity."
      />

      <Notice error={error} />

      <div className="dashboard-stats" aria-label="Library statistics">
        {dashboardCards.map((card) => (
          <article className="card dashboard-stat-card" key={card.key}>
            <div className="dashboard-stat-topline">
              <span className="dashboard-stat-icon" aria-hidden="true">{card.icon}</span>
              <span className="dashboard-stat-value">
                {loading ? '—' : (stats[card.key] ?? 0).toLocaleString('vi-VN')}
              </span>
            </div>
            <h3>{card.label}</h3>
            <p>{card.detail}</p>
          </article>
        ))}
      </div>

      <div className="card dashboard-recent-card">
        <div className="resource-list-heading">
          <h3>Recent borrow orders</h3>
          <p className="muted">The latest five requests and their current status.</p>
        </div>

        {loading ? (
          <div className="dashboard-loading"><div className="loader" /><span>Loading dashboard...</span></div>
        ) : recentOrders.length === 0 ? (
          <div className="empty-state">No borrow orders yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table dashboard-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Books</th>
                  <th>Requested</th>
                  <th>Due date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.code || `#${order.id}`}</strong></td>
                    <td>{getCustomerName(order)}</td>
                    <td className="dashboard-order-books">
                      {order.items?.map((item) => item.book?.title).filter(Boolean).join(', ') || '—'}
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{formatDate(order.dueAt)}</td>
                    <td><StatusPill status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default DashboardPage;
