import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';

function getPasswordBytes(value) {
  return new TextEncoder().encode(value).length;
}

function ResetPasswordPage({ onNavigate }) {
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReset, setIsReset] = useState(false);

  useEffect(() => {
    if (isReset) {
      window.history.replaceState(window.history.state, '', '/reset-password');
    }
  }, [isReset]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('This password reset link is invalid or has expired. Request a new one.');
      return;
    }
    if (password.length < 15) {
      setError('Password must be at least 15 characters.');
      return;
    }
    if (getPasswordBytes(password) > 72) {
      setError('Password must not exceed 72 UTF-8 bytes.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        token: null,
        body: { token, password, confirmPassword }
      });
      setIsReset(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="activation-page">
      <section className="activation-card">
        <div className="brand-mark activation-brand">
          <span className="brand-icon">M</span>
          <span>ManageBook</span>
        </div>

        {isReset ? (
          <div className="activation-result">
            <p className="eyebrow">Password recovery</p>
            <h1>Password updated</h1>
            <p className="muted">You can now sign in using your new password.</p>
            <button
              className="button button-primary button-wide"
              type="button"
              onClick={() => onNavigate('/login')}
            >
              Go to sign in
            </button>
          </div>
        ) : !token ? (
          <div className="activation-result">
            <p className="eyebrow">Password recovery</p>
            <h1>Reset link unavailable</h1>
            <p className="muted">This link is missing its token. Request a new password reset link.</p>
            <button
              className="button button-primary button-wide"
              type="button"
              onClick={() => onNavigate('/forgot-password')}
            >
              Request a new link
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Password recovery</p>
            <h1>Set a new password</h1>
            <p className="muted">Choose a strong password you have not used for this account before.</p>

            <form className="form-stack activation-form" onSubmit={handleSubmit}>
              <label>
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={15}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <p className="activation-hint">At least 15 characters and no more than 72 UTF-8 bytes.</p>
              <label>
                Confirm new password
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={15}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <button className="button button-primary button-wide" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating password...' : 'Reset password'}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default ResetPasswordPage;
