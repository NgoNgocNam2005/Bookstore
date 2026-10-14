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
  ['available', 'Available'],
  ['reserved', 'Reserved'],
  ['borrowed', 'Borrowed'],
  ['lost', 'Lost'],
  ['damaged', 'Damaged']
];

const editableStatuses = [
  ['available', 'Available'],
  ['lost', 'Lost'],
  ['damaged', 'Damaged']
];

function BookCopiesPage() {
  const { token, user } = useAuth();
  const canManage = ['admin', 'staff'].includes(user.role);

  const [copies, setCopies] = useState([]);
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 1000);
  const [bookFilter, setBookFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    bookId: '',
    copyCode: ''
  });
  const [statusForm, setStatusForm] = useState({
    id: null,
    status: 'available'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSearchQuery(debouncedSearch.trim());
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      try {
        const result = await apiRequest(
          '/books?status=active&page=1&limit=100',
          { token }
        );

        if (!cancelled) {
          setBooks(result.items || []);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      }
    }

    loadBooks();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function loadCopies() {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: String(page),
        limit: '10'
      });

      if (searchQuery) params.set('search', searchQuery);
      if (bookFilter) params.set('bookId', bookFilter);
      if (statusFilter) params.set('status', statusFilter);

      try {
        const result = await apiRequest(
          `/book-copies?${params.toString()}`,
          { token }
        );

        if (!cancelled) {
          setCopies(result.items || []);
          setMeta(result.meta || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          });
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCopies();

    return () => {
      cancelled = true;
    };
  }, [bookFilter, page, reloadKey, searchQuery, statusFilter, token]);

  function commitSearch() {
    setSearchQuery(searchInput.trim());
    setPage(1);
  }

  function openCreateForm() {
    setCreateForm({
      bookId: books[0]?.id ? String(books[0].id) : '',
      copyCode: ''
    });
    setShowCreateForm(true);
    setError('');
    setMessage('');
  }

  function openStatusForm(copy) {
    setStatusForm({
      id: copy.id,
      status: editableStatuses.some(([value]) => value === copy.status)
        ? copy.status
        : 'available'
    });
    setShowStatusForm(true);
    setError('');
    setMessage('');
  }

  function closeForms() {
    setShowCreateForm(false);
    setShowStatusForm(false);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await apiRequest('/book-copies', {
        method: 'POST',
        token,
        body: {
          bookId: Number(createForm.bookId),
          copyCode: createForm.copyCode.trim()
        }
      });

      closeForms();
      setMessage('Book copy created successfully.');
      setPage(1);
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleStatusUpdate(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await apiRequest(
        `/book-copies/${statusForm.id}/status`,
        {
          method: 'PATCH',
          token,
          body: { status: statusForm.status }
        }
      );

      closeForms();
      setMessage('Book copy status updated successfully.');
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="content-grid">
      <PageHeader
        eyebrow="Inventory"
        title="Book copies."
        description="Manage the physical copies of every book."
        action={canManage && (
          <button
            className="button button-primary"
            onClick={openCreateForm}
          >
            + Add copy
          </button>
        )}
      />

      <Notice error={error} message={message} />

      <Modal
        isOpen={showCreateForm}
        onClose={closeForms}
        title="Add book copy"
      >
        <form className="modal-form" onSubmit={handleCreate}>
          <div className="form-field">
            <label>Book</label>
            <select
              value={createForm.bookId}
              onChange={(event) => setCreateForm({
                ...createForm,
                bookId: event.target.value
              })}
              required
            >
              <option value="">Select a book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Copy code</label>
            <input
              placeholder="Example: BOOK-22-002"
              value={createForm.copyCode}
              onChange={(event) => setCreateForm({
                ...createForm,
                copyCode: event.target.value
              })}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="button-cancel"
              onClick={closeForms}
            >
              Cancel
            </button>
            <button type="submit" className="button-save">
              Save copy
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showStatusForm}
        onClose={closeForms}
        title="Update copy status"
      >
        <form
          className="modal-form"
          onSubmit={handleStatusUpdate}
        >
          <div className="form-field">
            <label>Status</label>
            <select
              value={statusForm.status}
              onChange={(event) => setStatusForm({
                ...statusForm,
                status: event.target.value
              })}
              required
            >
              {editableStatuses.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="button-cancel"
              onClick={closeForms}
            >
              Cancel
            </button>
            <button type="submit" className="button-save">
              Save status
            </button>
          </div>
        </form>
      </Modal>

      <div className="card resource-list-card">
        <div className="resource-list-heading resource-list-toolbar">
          <div>
            <h3>Book copy inventory</h3>
            <p className="muted">{meta.total} copies.</p>
          </div>

          <div className="book-filters">
            <input
              className="resource-search"
              placeholder="Search copy code or book..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitSearch();
              }}
            />

            <select
              value={bookFilter}
              onChange={(event) => {
                setBookFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All books</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading book copies...</div>
        ) : copies.length === 0 ? (
          <div className="empty-state">No book copies found.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Copy code</th>
                  <th>Book</th>
                  <th>Status</th>
                  {canManage && <th className="text-right">Actions</th>}
                </tr>
              </thead>

              <tbody>
                {copies.map((copy) => (
                  <tr key={copy.id}>
                    <td className="font-medium">{copy.copyCode}</td>
                    <td>{copy.book?.title || 'Unknown book'}</td>
                    <td><StatusPill status={copy.status} /></td>
                    {canManage && (
                      <td className="text-right">
                        {!['reserved', 'borrowed'].includes(copy.status) && (
                          <button
                            className="button button-ghost"
                            onClick={() => openStatusForm(copy)}
                          >
                            Edit status
                          </button>
                        )}
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
          onPrevious={() => setPage((value) => value - 1)}
          onNext={() => setPage((value) => value + 1)}
        />
      </div>
    </section>
  );
}

export default BookCopiesPage;
