import { useEffect, useState } from 'react';
import Notice from '../components/catalogue/Notice.jsx';
import PageHeader from '../components/catalogue/PageHeader.jsx';
import Pagination from '../components/catalogue/Pagination.jsx';
import StatusPill from '../components/catalogue/StatusPill.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { apiRequest } from '../services/api.js';

const roles = [
  ['user', 'User'],
  ['staff', 'Staff'],
  ['editor', 'Editor'],
  ['admin', 'Admin']
];

const initialMeta = { page: 1, limit: 10, total: 0, totalPages: 0 };

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date);
}

function UsersPage() {
  const { user: currentUser, token } = useAuth();
  const canViewUsers = currentUser.role === 'admin';
  const canEditAccess = currentUser.role === 'admin';
  const [users, setUsers] = useState([]);
  const [recentlyCreated, setRecentlyCreated] = useState(null);
  const [meta, setMeta] = useState(initialMeta);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 1000);
  const [form, setForm] = useState({ fullName: '', email: '', username: '', phone: '' });
  const [editValues, setEditValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSearchQuery(debouncedSearch.trim());
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      if (!canViewUsers) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        role: 'user'
      });
      if (searchQuery) params.set('search', searchQuery);

      try {
        const result = await apiRequest(`/users?${params.toString()}`, { token });
        if (!cancelled) {
          setUsers(result.items || []);
          setMeta(result.meta || initialMeta);
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUsers();
    return () => { cancelled = true; };
  }, [canViewUsers, page, reloadKey, searchQuery, token]);

  function commitSearch() {
    setSearchQuery(searchInput.trim());
    setPage(1);
  }

  function reloadUsers() {
    setPage(1);
    setReloadKey((value) => value + 1);
  }

  async function createAccount(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    const body = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      ...(form.username.trim() ? { username: form.username.trim() } : {}),
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {})
    };

    try {
      const result = await apiRequest('/users', { method: 'POST', token, body });
      setForm({ fullName: '', email: '', username: '', phone: '' });
      setRecentlyCreated(result.user || null);
      setMessage('Tài khoản đã được tạo. Email mời kích hoạt đã được gửi cho user.');
      if (canViewUsers) reloadUsers();
    } catch (requestError) {
      if (requestError.code === 'INVITATION_EMAIL_FAILED') {
        setMessage(canViewUsers
          ? `${requestError.message} Tải lại danh sách để gửi lại lời mời.`
          : 'Tài khoản đã được tạo nhưng email chưa gửi được. Vui lòng báo admin để gửi lại lời mời.');
        if (canViewUsers) reloadUsers();
      } else {
        setError(requestError.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function resendInvitation(account) {
    setBusyAction(`resend-${account.id}`);
    setError('');
    setMessage('');

    try {
      await apiRequest(`/users/${account.id}/resend-invitation`, {
        method: 'POST',
        token
      });
      setMessage(`Đã gửi lại email kích hoạt tới ${account.email}.`);
      if (!canViewUsers) setRecentlyCreated(account);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyAction('');
    }
  }

  function beginEdit(account) {
    setEditValues((current) => ({
      ...current,
      [account.id]: { role: account.role, status: account.status }
    }));
  }

  function changeEdit(accountId, field, value) {
    setEditValues((current) => ({
      ...current,
      [accountId]: { ...current[accountId], [field]: value }
    }));
  }

  async function saveAccess(account) {
    const next = editValues[account.id];
    if (!next) return;

    setBusyAction(`save-${account.id}`);
    setError('');
    setMessage('');

    try {
      await apiRequest(`/users/${account.id}`, {
        method: 'PATCH',
        token,
        body: next
      });
      setMessage(`Đã cập nhật quyền truy cập của ${account.email}.`);
      setEditValues((current) => {
        const updated = { ...current };
        delete updated[account.id];
        return updated;
      });
      if (canViewUsers) reloadUsers();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyAction('');
    }
  }

  return (
    <section className="content-grid users-page">
      <PageHeader
        eyebrow="Account administration"
        title="User accounts."
        description="Tạo tài khoản khách hàng bằng lời mời email; user tự đặt mật khẩu khi kích hoạt."
      />

      <Notice error={error} message={message} />

      <div className="card users-create-card">
        <div className="resource-list-heading">
          <h3>Tạo tài khoản user</h3>
          <p className="muted">Không đặt mật khẩu thay user. Hệ thống sẽ gửi liên kết kích hoạt tới email.</p>
        </div>

        <form className="users-create-form" onSubmit={createAccount}>
          <label>
            Họ và tên <span className="required-mark">*</span>
            <input
              autoComplete="name"
              required
              maxLength={150}
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              placeholder="Nguyễn Văn A"
            />
          </label>
          <label>
            Email <span className="required-mark">*</span>
            <input
              type="email"
              autoComplete="email"
              required
              maxLength={255}
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="user@example.com"
            />
          </label>
          <label>
            Username <span className="optional-label">(không bắt buộc)</span>
            <input
              autoComplete="off"
              minLength={3}
              maxLength={100}
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              placeholder="username"
            />
          </label>
          <label>
            Số điện thoại <span className="optional-label">(không bắt buộc)</span>
            <input
              type="tel"
              autoComplete="tel"
              maxLength={30}
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="09xx xxx xxx"
            />
          </label>
          <div className="users-form-action">
            <span className="muted">Role được backend gán cố định là User.</span>
            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo và gửi lời mời'}
            </button>
          </div>
        </form>
      </div>

      {!canViewUsers && recentlyCreated && (
        <div className="card users-recent-invite-card">
          <div>
            <h3>Lời mời vừa tạo</h3>
            <p className="muted">{recentlyCreated.fullName} · {recentlyCreated.email}</p>
          </div>
          <div className="users-recent-invite-actions">
            <StatusPill status={recentlyCreated.status} />
            {recentlyCreated.status === 'invited' && (
              <button
                className="button button-ghost button-small"
                type="button"
                disabled={busyAction === `resend-${recentlyCreated.id}`}
                onClick={() => resendInvitation(recentlyCreated)}
              >
                {busyAction === `resend-${recentlyCreated.id}` ? 'Đang gửi...' : 'Gửi lại email'}
              </button>
            )}
          </div>
        </div>
      )}

      {canViewUsers && <div className="card resource-list-card users-list-card">
        <div className="resource-list-heading resource-list-toolbar">
          <div>
            <h3>Danh sách tài khoản user</h3>
            <p className="muted">{meta.total} tài khoản · tìm theo tên, email hoặc username.</p>
          </div>
          <input
            className="resource-search"
            type="search"
            placeholder="Tìm tài khoản..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitSearch();
            }}
          />
        </div>

        {loading ? (
          <div className="empty-state">Đang tải tài khoản...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">Không tìm thấy tài khoản user.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Username</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  {canEditAccess && <th>Quyền / thao tác</th>}
                  <th className="text-right">Lời mời</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => {
                  const editing = editValues[account.id];
                  const isCurrentUser = String(account.id) === String(currentUser.id);

                  return (
                    <tr key={account.id}>
                      <td>
                        <strong>{account.fullName || 'Chưa cập nhật tên'}</strong>
                        <small className="table-subtext">{account.email}</small>
                      </td>
                      <td>{account.username || '—'}</td>
                      <td>{formatDate(account.createdAt)}</td>
                      <td><StatusPill status={account.status} /></td>
                      {canEditAccess && (
                        <td className="users-access-cell">
                          {editing ? (
                            <div className="users-access-editor">
                              <select
                                aria-label={`Role for ${account.email}`}
                                value={editing.role}
                                onChange={(event) => changeEdit(account.id, 'role', event.target.value)}
                              >
                                {roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                              </select>
                              <select
                                aria-label={`Status for ${account.email}`}
                                value={editing.status}
                                onChange={(event) => changeEdit(account.id, 'status', event.target.value)}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                              <button
                                className="button button-primary button-small"
                                type="button"
                                disabled={busyAction === `save-${account.id}`}
                                onClick={() => saveAccess(account)}
                              >
                                Lưu
                              </button>
                              <button
                                className="button button-ghost button-small"
                                type="button"
                                onClick={() => setEditValues((current) => {
                                  const updated = { ...current };
                                  delete updated[account.id];
                                  return updated;
                                })}
                              >
                                Hủy
                              </button>
                            </div>
                          ) : account.status === 'invited' ? (
                            <span className="muted">Chỉ đổi role sau khi kích hoạt</span>
                          ) : isCurrentUser ? (
                            <span className="muted">Không thể tự sửa quyền</span>
                          ) : (
                            <button className="button button-ghost button-small" type="button" onClick={() => beginEdit(account)}>
                              Chỉnh quyền
                            </button>
                          )}
                        </td>
                      )}
                      <td className="text-right">
                        {account.status === 'invited' ? (
                          <button
                            className="button button-ghost button-small"
                            type="button"
                            disabled={busyAction === `resend-${account.id}`}
                            onClick={() => resendInvitation(account)}
                          >
                            {busyAction === `resend-${account.id}` ? 'Đang gửi...' : 'Gửi lại email'}
                          </button>
                        ) : <span className="muted">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && meta.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={meta.totalPages}
            onPrevious={() => setPage((value) => Math.max(1, value - 1))}
            onNext={() => setPage((value) => Math.min(meta.totalPages, value + 1))}
            onPageChange={setPage}
          />
        )}
      </div>}
    </section>
  );
}

export default UsersPage;
