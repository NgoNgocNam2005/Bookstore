import { useState } from 'react';

function LoginPage({ onLogin, onNavigate }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onLogin({ identifier, password });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <div className="brand-mark light-brand">
          <span className="brand-icon">M</span>
          <span>ManageBook</span>
        </div>
        <div className="intro-copy">
          <p className="eyebrow">Your library, organised</p>
          <h1>Everything your book store needs, in one calm workspace.</h1>
          <p>
            Manage your catalogue, keep your team aligned and make every title
            easy to find.
          </p>
        </div>
        <div className="intro-note">Phase 1 · Secure account access</div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-brand brand-mark">
            <span className="brand-icon">M</span>
            <span>ManageBook</span>
          </div>

          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to your workspace</h2>
          <p className="muted">Use the account created by your administrator.</p>

          <form className="form-stack" onSubmit={handleSubmit}>
            <label>
              Email or username
              <input
                autoComplete="username"
                placeholder="you@example.com"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                autoComplete="current-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <button
              className="auth-text-button"
              type="button"
              onClick={() => onNavigate('/forgot-password')}
            >
              Forgot password?
            </button>

            {error && <p className="form-error">{error}</p>}

            <button className="button button-primary button-wide" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="form-footnote">
            Don&apos;t have an account? Contact your administrator.
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
