import { useState } from 'react';
import { apiRequest } from '../services/api.js';

function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        token: null,
        body: { email: email.trim() }
      });
      setRequestSent(true);
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

        {requestSent ? (
          <div className="activation-result">
            <p className="eyebrow">Password recovery</p>
            <h1>Check your inbox</h1>
            <p className="muted">
              If an active account matches that email, password reset instructions will be sent.
              Check your spam folder too.
            </p>
            <button
              className="button button-primary button-wide"
              type="button"
              onClick={() => onNavigate('/login')}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Password recovery</p>
            <h1>Forgot your password?</h1>
            <p className="muted">
              Enter the email address associated with your account. We’ll send a reset link if the account is active.
            </p>

            <form className="form-stack activation-form" onSubmit={handleSubmit}>
              <label>
                Account email
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  maxLength={255}
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <button
                className="button button-primary button-wide"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </button>
              <button
                className="auth-text-button auth-text-button-centered"
                type="button"
                onClick={() => onNavigate('/login')}
              >
                Back to sign in
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
