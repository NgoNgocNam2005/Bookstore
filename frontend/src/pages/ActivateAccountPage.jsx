import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';

function getPasswordBytes(value) {
  return new TextEncoder().encode(value).length;
}

function ActivateAccountPage({ onNavigate }) {
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    if (isActivated) {
      window.history.replaceState(window.history.state, '', '/activate-account');
    }
  }, [isActivated]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('Liên kết kích hoạt không hợp lệ hoặc đã hết hạn. Hãy yêu cầu gửi lại email mời.');
      return;
    }
    if (password.length < 15) {
      setError('Mật khẩu cần có ít nhất 15 ký tự.');
      return;
    }
    if (getPasswordBytes(password) > 72) {
      setError('Mật khẩu không được vượt quá 72 byte UTF-8.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/auth/activate-account', {
        method: 'POST',
        token: null,
        body: { token, password, confirmPassword }
      });
      setIsActivated(true);
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

        {isActivated ? (
          <div className="activation-result">
            <p className="eyebrow">Account ready</p>
            <h1>Đã kích hoạt tài khoản</h1>
            <p className="muted">Bạn có thể đăng nhập bằng email và mật khẩu vừa tạo.</p>
            <button className="button button-primary button-wide" type="button" onClick={() => onNavigate('/login')}>
              Đến trang đăng nhập
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Secure account setup</p>
            <h1>Kích hoạt tài khoản</h1>
            <p className="muted">Tạo mật khẩu riêng. Nhân viên tạo tài khoản không thể xem mật khẩu này.</p>

            <form className="form-stack activation-form" onSubmit={handleSubmit}>
              <label>
                Mật khẩu mới
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={15}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <p className="activation-hint">Ít nhất 15 ký tự, tối đa 72 byte UTF-8.</p>
              <label>
                Nhập lại mật khẩu
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
                {isSubmitting ? 'Đang kích hoạt...' : 'Đặt mật khẩu và kích hoạt'}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default ActivateAccountPage;
