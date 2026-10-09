import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/catalogue/Modal.jsx';
import Notice from '../components/catalogue/Notice.jsx';
import PageHeader from '../components/catalogue/PageHeader.jsx';
import Pagination from '../components/catalogue/Pagination.jsx';
import StatusPill from '../components/catalogue/StatusPill.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { apiRequest } from '../services/api.js';

const initialBook = {
  categoryId: '',
  title: '',
  author: '',
  isbn: '',
  description: '',
  coverUrl: '',
  publishedYear: '',
  status: 'draft'
};

function BooksPage() {
  const { token, user } = useAuth();
  const canManage = ['admin', 'editor'].includes(user.role);
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [bookForm, setBookForm] = useState(initialBook);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
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
      try {
        const result = await apiRequest('/book-categories', { token });
        if (!cancelled) setCategories(result.items);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page: String(page), limit: '10' });

      if (searchQuery) params.set('search', searchQuery);
      if (categoryFilter) params.set('categoryId', categoryFilter);

      try {
        const result = await apiRequest(`/books?${params.toString()}`, { token });

        if (!cancelled) {
          setBooks(result.items);
          setMeta(result.meta);
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBooks();

    return () => {
      cancelled = true;
    };
  }, [categoryFilter, page, searchQuery, token]);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.status === 'active'),
    [categories]
  );

  function resetForm() {
    setBookForm({
      ...initialBook,
      categoryId: activeCategories[0]?.id ? String(activeCategories[0].id) : ''
    });
    setEditingId(null);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
    setError('');
    setMessage('');
  }

  function openEditForm(book) {
    setBookForm({
      categoryId: String(book.categoryId),
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      description: book.description || '',
      coverUrl: book.coverUrl || '',
      publishedYear: book.publishedYear || '',
      status: book.status
    });
    setEditingId(book.id);
    setShowForm(true);
    setError('');
    setMessage('');
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  function commitSearch() {
    setSearchQuery(searchInput.trim());
    setPage(1);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    const body = {
      categoryId: Number(bookForm.categoryId),
      title: bookForm.title,
      author: bookForm.author || null,
      isbn: bookForm.isbn || null,
      description: bookForm.description || null,
      coverUrl: bookForm.coverUrl || null,
      publishedYear: bookForm.publishedYear ? Number(bookForm.publishedYear) : null,
      status: bookForm.status
    };

    try {
      await apiRequest(editingId ? `/books/${editingId}` : '/books', {
        method: editingId ? 'PATCH' : 'POST',
        token,
        body
      });

      setMessage(editingId ? 'Book updated successfully.' : 'Book created successfully.');
      closeForm();
      setPage(1);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deactivateBook(bookId) {
    if (!window.confirm('Deactivate this book?')) return;

    try {
      await apiRequest(`/books/${bookId}`, { method: 'DELETE', token });
      setMessage('Book deactivated successfully.');
      setPage(1);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="content-grid">
      <PageHeader
        eyebrow="Catalogue"
        title="Books."
        description="Manage every title and keep it connected to a category."
        action={canManage && (
          <button className="button button-primary" onClick={openCreateForm}>
            + Add book
          </button>
        )}
      />

      <Notice error={error} message={message} />

      <Modal
        isOpen={showForm && canManage}
        onClose={closeForm}
        title={editingId ? 'Chỉnh sửa sách' : 'Thêm sách'}
      >
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label>Tên sách <span className="required">*</span></label>
              <input
                placeholder="Nhập tên sách"
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                required
              />
            </div>
            <div className="form-field">
              <label>Danh mục <span className="required">*</span></label>
              <select
                value={bookForm.categoryId}
                onChange={(e) => setBookForm({ ...bookForm, categoryId: e.target.value })}
                required
              >
                <option value="">Chọn danh mục</option>
                {activeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Tác giả</label>
              <input
                placeholder="Nhập tên tác giả"
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>ISBN</label>
              <input
                placeholder="Nhập mã ISBN"
                value={bookForm.isbn}
                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Năm xuất bản</label>
              <input
                type="number" min="0" max="3000"
                placeholder="VD: 2023"
                value={bookForm.publishedYear}
                onChange={(e) => setBookForm({ ...bookForm, publishedYear: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Trạng thái <span className="required">*</span></label>
              <select
                value={bookForm.status}
                onChange={(e) => setBookForm({ ...bookForm, status: e.target.value })}
              >
                <option value="draft">Nháp</option>
                <option value="active">Hiển thị</option>
                <option value="inactive">Ẩn</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>URL ảnh bìa</label>
            <input
              type="url"
              placeholder="https://..."
              value={bookForm.coverUrl}
              onChange={(e) => setBookForm({ ...bookForm, coverUrl: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label>Mô tả</label>
            <textarea
              rows="3"
              placeholder="Nhập mô tả sách..."
              value={bookForm.description}
              onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="button-cancel" onClick={closeForm}>Huỷ bỏ</button>
            <button type="submit" className="button-save">{editingId ? 'Lưu lại' : 'Lưu lại'}</button>
          </div>
        </form>
      </Modal>

      <div className="card resource-list-card">
        <div className="catalogue-toolbar">
          <div>
            <h3>Book catalogue</h3>
            <p className="muted">{meta.total} books · search by title, author or ISBN.</p>
          </div>
          <div className="book-filters">
            <input
              className="search-input"
              placeholder="Search books..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitSearch();
              }}
            />
            <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1); }}>
              <option value="">All categories</option>
              {activeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="empty-state">No books found.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Cover</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Status</th>
                  {canManage && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>
                      <div style={{ width: '40px', height: '56px', borderRadius: '4px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontWeight: 'bold', color: '#94a3b8' }}>{book.title.slice(0, 1).toUpperCase()}</span>
                        )}
                      </div>
                    </td>
                    <td className="font-medium">{book.title}</td>
                    <td>{book.author || 'Unknown author'}</td>
                    <td>{book.category?.name || 'Uncategorised'}</td>
                    <td><StatusPill status={book.status} /></td>
                    {canManage && (
                      <td className="text-right">
                        <div className="table-actions">
                          <button className="button button-ghost" onClick={() => openEditForm(book)}>Edit</button>
                          <button className="button button-danger" onClick={() => deactivateBook(book.id)}>Deactivate</button>
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

export default BooksPage;
