import { useEffect, useState } from 'react';
import Modal from '../components/catalogue/Modal.jsx';
import PageHeader from '../components/catalogue/PageHeader.jsx';
import Notice from '../components/catalogue/Notice.jsx';
import Pagination from '../components/catalogue/Pagination.jsx';
import StatusPill from '../components/catalogue/StatusPill.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../services/api.js';

const initialForm = {
  name: '',
  description: '',
  status: 'active'
};

function CategoriesPage() {
  const { token, user } = useAuth();
  const canManage = ['admin', 'editor'].includes(user.role);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSearchQuery(debouncedSearch.trim());
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page: String(page), limit: '10' });

      if (searchQuery) params.set('search', searchQuery);

      try {
        const result = await apiRequest(`/book-categories?${params.toString()}`, { token });

        if (!cancelled) {
          setCategories(result.items);
          setMeta(result.meta);
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [page, reloadKey, searchQuery, token]);

  function commitSearch() {
    setSearchQuery(searchInput.trim());
    setPage(1);
  }

  function openCreateForm() {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
    setError('');
    setMessage('');
  }

  function openEditForm(category) {
    setForm({
      name: category.name,
      description: category.description || '',
      status: category.status
    });
    setEditingId(category.id);
    setShowForm(true);
    setError('');
    setMessage('');
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    const wasEditing = Boolean(editingId);

    try {
      await apiRequest(
        wasEditing ? `/book-categories/${editingId}` : '/book-categories',
        {
          method: wasEditing ? 'PATCH' : 'POST',
          token,
          body: {
            name: form.name,
            description: form.description || null,
            ...(wasEditing ? { status: form.status } : {})
          }
        }
      );

      closeForm();
      setMessage(wasEditing ? 'Category updated successfully.' : 'Category created successfully.');
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deactivateCategory(categoryId) {
    if (!window.confirm('Deactivate this category?')) return;

    setError('');
    setMessage('');

    try {
      await apiRequest(`/book-categories/${categoryId}`, {
        method: 'DELETE',
        token
      });
      setMessage('Category deactivated successfully.');
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="content-grid">
      <PageHeader
        eyebrow="Catalogue"
        title="Book categories."
        description="Keep the catalogue structured and easy to browse."
        action={canManage && (
          <button className="button button-primary" onClick={openCreateForm}>
            + Add category
          </button>
        )}
      />

      <Notice error={error} message={message} />

      <Modal
        isOpen={showForm && canManage}
        onClose={closeForm}
        title={editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
      >
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Tên danh mục <span className="required">*</span></label>
            <input
              placeholder="VD: Văn học, Khoa học..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label>Trạng thái <span className="required">*</span></label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              disabled={!editingId}
            >
              <option value="active">Hiển thị</option>
              <option value="inactive">Ẩn</option>
            </select>
          </div>

          <div className="form-field">
            <label>Mô tả</label>
            <textarea
              rows="4"
              placeholder="Nhập mô tả danh mục..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="button-cancel" onClick={closeForm}>Huỷ bỏ</button>
            <button type="submit" className="button-save">{editingId ? 'Lưu lại' : 'Lưu lại'}</button>
          </div>
        </form>
      </Modal>

      <div className="card resource-list-card">
        <div className="resource-list-heading resource-list-toolbar">
          <div>
            <h3>All categories</h3>
            <p className="muted">{meta.total} categories</p>
          </div>
          <input
            className="resource-search"
            placeholder="Search categories..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitSearch();
            }}
          />
        </div>

        {loading ? (
          <div className="empty-state">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">No categories found.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Books</th>
                  <th>Status</th>
                  {canManage && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="font-medium">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: '50%', fontWeight: 'bold', color: '#475569' }}>
                          {category.name.slice(0, 1).toUpperCase()}
                        </div>
                        {category.name}
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {category.description || 'No description added.'}
                    </td>
                    <td>{category.bookCount ?? 0}</td>
                    <td><StatusPill status={category.status} /></td>
                    {canManage && (
                      <td className="text-right">
                        <div className="table-actions">
                          <button className="button button-ghost" onClick={() => openEditForm(category)}>Edit</button>
                          {category.status === 'active' && (
                            <button className="button button-danger" onClick={() => deactivateCategory(category.id)}>
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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
    </section>
  );
}

export default CategoriesPage;
