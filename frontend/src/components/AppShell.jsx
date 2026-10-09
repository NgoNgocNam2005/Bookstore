function getInitials(user) {
  const name = user.fullName || user.username || user.email || 'U';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function AppShell({ user, onLogout, onNavigate, currentPath, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <span className="brand-icon">M</span>
          <span>ManageBook</span>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="nav-label">Workspace</span>
          <a
            className={`nav-item ${currentPath === '/profile' ? 'active' : ''}`}
            href="/profile"
            onClick={(event) => {
              event.preventDefault();
              onNavigate('/profile');
            }}
          >
            <span>◉</span>
            Profile
          </a>
          <a
            className={`nav-item ${currentPath === '/books' ? 'active' : ''}`}
            href="/books"
            onClick={(event) => {
              event.preventDefault();
              onNavigate('/books');
            }}
          >
            <span>▦</span>
            Books
          </a>
          <a
            className={`nav-item ${currentPath === '/categories' ? 'active' : ''}`}
            href="/categories"
            onClick={(event) => {
              event.preventDefault();
              onNavigate('/categories');
            }}
          >
            <span>▤</span>
            Categories
          </a>
          {user.role === 'admin' ? (
            <a
              className={`nav-item ${currentPath === '/borrow-orders' ? 'active' : ''}`}
              href="/borrow-orders"
              onClick={(event) => {
                event.preventDefault();
                onNavigate('/borrow-orders');
              }}
            >
              <span>↔</span>
              Borrow orders
            </a>
          ) : (
            <a
              className={`nav-item ${currentPath === '/borrow' ? 'active' : ''}`}
              href="/borrow"
              onClick={(event) => {
                event.preventDefault();
                onNavigate('/borrow');
              }}
            >
              <span>↗</span>
              Borrow books
            </a>
          )}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          System operational
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Book store management</p>
            <h1>Account settings</h1>
          </div>

          <div className="account-menu">
            <div className="avatar">{getInitials(user)}</div>
            <div className="account-summary">
              <strong>{user.fullName || user.username || user.email}</strong>
              <span>{user.role}</span>
            </div>
            <button className="button button-ghost" type="button" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

export default AppShell;
