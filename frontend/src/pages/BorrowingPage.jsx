import { useEffect, useState } from 'react';
import Modal from '../components/catalogue/Modal.jsx';
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

function getOrderBooks(order) {
  return order.items?.map((item) => item.book?.title).filter(Boolean).join(', ') || 'No books';
}

function BorrowingPage() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [booksMeta, setBooksMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [orders, setOrders] = useState([]);
  const [ordersMeta, setOrdersMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [bookSearchInput, setBookSearchInput] = useState('');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const debouncedBookSearch = useDebouncedValue(bookSearchInput);
  const [bookPage, setBookPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [ordersReloadKey, setOrdersReloadKey] = useState(0);
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState('');
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setBookSearchQuery(debouncedBookSearch.trim());
    setBookPage(1);
  }, [debouncedBookSearch]);

  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      setLoadingBooks(true);
      const params = new URLSearchParams({
        status: 'active',
        page: String(bookPage),
        limit: '10'
      });
      if (bookSearchQuery) params.set('search', bookSearchQuery);

      try {
        const result = await apiRequest(`/books?${params.toString()}`, { token });
        if (!cancelled) {
          setBooks(result.items);
          setBooksMeta(result.meta);
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoadingBooks(false);
      }
    }

    loadBooks();
    return () => { cancelled = true; };
  }, [bookPage, bookSearchQuery, token]);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const result = await apiRequest(`/borrow-orders/my?page=${orderPage}&limit=10`, { token });
        if (!cancelled) {
          setOrders(result.items);
          setOrdersMeta(result.meta);
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    }

    loadOrders();
    return () => { cancelled = true; };
  }, [orderPage, ordersReloadKey, token]);

  function commitSearch() {
    setBookSearchQuery(bookSearchInput.trim());
    setBookPage(1);
  }

  function toggleBook(bookId) {
    setSelectedBookIds((current) => current.includes(bookId)
      ? current.filter((id) => id !== bookId)
      : [...current, bookId]);
  }

  function closeForm() {
    setShowForm(false);
    setNote('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await apiRequest('/borrow-orders', {
        method: 'POST',
        token,
        body: { bookIds: selectedBookIds, note: note || null }
      });
      setSelectedBookIds([]);
      closeForm();
      setOrderPage(1);
      setOrdersReloadKey((value) => value + 1);
      setMessage('Borrow request created successfully.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelOrder(orderId) {
    if (!window.confirm('Cancel this borrow request?')) return;

    setError('');
    try {
      await apiRequest(`/borrow-orders/my/${orderId}/cancel`, {
        method: 'PATCH',
        token
      });
      setMessage('Borrow request cancelled.');
      setOrderPage(1);
      setOrdersReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="content-grid">
      <PageHeader
        eyebrow="Customer borrowing"
        title="Borrow books."
        description="Choose available books and send a request to the library team."
        action={(
          <button
            className="button button-primary"
            disabled={selectedBookIds.length === 0}
            onClick={() => { setShowForm(true); setError(''); setMessage(''); }}
          >
            Request selected ({selectedBookIds.length})
          </button>
        )}
      />

      <Notice error={error} message={message} />

      <div className="card resource-list-card borrowing-card">
        <div className="resource-list-heading resource-list-toolbar">
          <div>
            <h3>Available books</h3>
            <p className="muted">{booksMeta.total} books available for borrowing.</p>
          </div>
          <input
            className="resource-search"
            placeholder="Search books..."
            value={bookSearchInput}
            onChange={(event) => setBookSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitSearch();
            }}
          />
        </div>

        {loadingBooks ? (
          <div className="empty-state">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="empty-state">No available books found.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th aria-label="Select" />
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>
                      <input
                        className="book-select"
                        type="checkbox"
                        checked={selectedBookIds.includes(book.id)}
                        onChange={() => toggleBook(book.id)}
                        aria-label={`Select ${book.title}`}
                      />
                    </td>
                    <td className="font-medium">{book.title}</td>
                    <td>{book.author || 'Unknown author'}</td>
                    <td>{book.category?.name || 'Uncategorised'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={bookPage}
          totalPages={booksMeta.totalPages}
          onPageChange={setBookPage}
          onPrevious={() => setBookPage((current) => current - 1)}
          onNext={() => setBookPage((current) => current + 1)}
        />
      </div>

      <div className="card resource-list-card borrowing-card">
        <div className="resource-list-heading">
          <h3>My borrow requests</h3>
          <p className="muted">Track the approval and return status of your requests.</p>
        </div>

        {loadingOrders ? (
          <div className="empty-state">Loading borrow requests...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">You have no borrow requests yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
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
                    <td className="order-books">{getOrderBooks(order)}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{formatDate(order.dueAt)}</td>
                    <td><StatusPill status={order.status} /></td>
                    <td className="text-right">
                      {order.status === 'pending' && (
                        <button className="button button-danger" onClick={() => cancelOrder(order.id)}>
                          Cancel
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
          page={orderPage}
          totalPages={ordersMeta.totalPages}
          onPageChange={setOrderPage}
          onPrevious={() => setOrderPage((current) => current - 1)}
          onNext={() => setOrderPage((current) => current + 1)}
        />
      </div>

      <Modal isOpen={showForm} onClose={closeForm} title="Create borrow request">
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Selected books</label>
            <ul className="selected-book-list">
              {selectedBookIds.map((bookId) => {
                const book = books.find((item) => item.id === bookId);
                return <li key={bookId}>{book?.title || `Book #${bookId}`}</li>;
              })}
            </ul>
          </div>
          <div className="form-field">
            <label>Note</label>
            <textarea
              rows="4"
              maxLength="2000"
              placeholder="Add a note for the library team..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="button-cancel" onClick={closeForm}>Cancel</button>
            <button type="submit" className="button-save" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send request'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default BorrowingPage;
