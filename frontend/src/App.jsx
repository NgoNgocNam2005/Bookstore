import { useEffect, useState } from 'react';
import AppShell from './components/AppShell.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import BooksPage from './pages/BooksPage.jsx';
import BookCopiesPage from './pages/BookCopiesPage.jsx';
import BorrowingPage from './pages/BorrowingPage.jsx';
import BorrowOrdersPage from './pages/BorrowOrdersPage.jsx';
import OverdueOrdersPage from './pages/OverdueOrdersPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ActivateAccountPage from './pages/ActivateAccountPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

function AppContent() {
  const {
    user,
    isLoading,
    login,
    logout,
    updateProfile,
    changePassword
  } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(nextPath) {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  }

  useEffect(() => {
    const publicPaths = [
      '/login',
      '/activate-account',
      '/forgot-password',
      '/reset-password'
    ];

    if (!isLoading && !user && !publicPaths.includes(path)) {
      navigate('/login');
    }

    if (!isLoading && user && path === '/login') {
      navigate('/profile');
    }
  }, [isLoading, path, user]);

  if (isLoading) {
    return (
      <main className="loading-page">
        <div className="loader" />
        <p>Loading your workspace...</p>
      </main>
    );
  }

  if (path === '/activate-account') {
    return <ActivateAccountPage onNavigate={navigate} />;
  }

  if (path === '/forgot-password') {
    return <ForgotPasswordPage onNavigate={navigate} />;
  }

  if (path === '/reset-password') {
    return <ResetPasswordPage onNavigate={navigate} />;
  }

  if (!user) {
    return <LoginPage onLogin={login} onNavigate={navigate} />;
  }

  return (
    <AppShell
      user={user}
      currentPath={path}
      onNavigate={navigate}
      onLogout={() => { logout(); navigate('/login'); }}
    >
      {path === '/dashboard' && user.role === 'admin' ? <DashboardPage />
        : path === '/users' && ['admin', 'editor', 'staff'].includes(user.role) ? <UsersPage />
        : path === '/books' ? <BooksPage />
        : path === '/categories' ? <CategoriesPage />
          : path === '/book-copies' && ['admin', 'staff'].includes(user.role)
            ? <BookCopiesPage />
            : path === '/borrow' ? <BorrowingPage />
            : path === '/overdue-orders' && user.role === 'admin' ? <OverdueOrdersPage />
            : path === '/borrow-orders' && user.role === 'admin' ? <BorrowOrdersPage /> : (
        <ProfilePage
          user={user}
          onUpdateProfile={updateProfile}
          onChangePassword={changePassword}
        />
      )}
    </AppShell>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
