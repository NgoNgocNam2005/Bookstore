import { useEffect, useState } from 'react';

function ProfilePage({ user, onUpdateProfile, onChangePassword }) {
  const [profile, setProfile] = useState({
    fullName: user.fullName || '',
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || ''
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setProfile({
      fullName: user.fullName || '',
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || ''
    });
  }, [user]);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileMessage('');
    setProfileError('');
    setIsSavingProfile(true);

    try {
      await onUpdateProfile({
        fullName: profile.fullName,
        phone: profile.phone || null,
        avatarUrl: profile.avatarUrl || null
      });
      setProfileMessage('Profile updated successfully.');
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsSavingPassword(true);

    try {
      await onChangePassword(passwords);
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordMessage('Password updated successfully.');
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <section className="content-grid">
      <div className="page-heading">
        <p className="eyebrow">Personal details</p>
        <h2>Make your account yours.</h2>
        <p className="muted">Update the information your team sees in the workspace.</p>
      </div>

      <div className="profile-grid">
        <form className="card form-stack" onSubmit={handleProfileSubmit}>
          <div className="card-heading">
            <div>
              <h3>Profile information</h3>
              <p className="muted">Your public account details.</p>
            </div>
            <span className="badge">{user.status}</span>
          </div>

          <label>
            Full name
            <input
              value={profile.fullName}
              onChange={(event) => setProfile({ ...profile, fullName: event.target.value })}
              placeholder="Your full name"
              required
            />
          </label>

          <label>
            Phone number
            <input
              value={profile.phone}
              onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
              placeholder="+84 90 000 0000"
            />
          </label>

          <label>
            Avatar URL
            <input
              type="url"
              value={profile.avatarUrl}
              onChange={(event) => setProfile({ ...profile, avatarUrl: event.target.value })}
              placeholder="https://..."
            />
          </label>

          {profileError && <p className="form-error">{profileError}</p>}
          {profileMessage && <p className="form-success">{profileMessage}</p>}

          <div className="card-actions">
            <button className="button button-primary" disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>

        <form className="card form-stack" onSubmit={handlePasswordSubmit}>
          <div className="card-heading">
            <div>
              <h3>Change password</h3>
              <p className="muted">Keep your account protected.</p>
            </div>
            <span className="security-icon">✦</span>
          </div>

          <label>
            Current password
            <input
              type="password"
              autoComplete="current-password"
              value={passwords.currentPassword}
              onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
              required
            />
          </label>

          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={passwords.newPassword}
              onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
              required
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={passwords.confirmPassword}
              onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })}
              required
            />
          </label>

          {passwordError && <p className="form-error">{passwordError}</p>}
          {passwordMessage && <p className="form-success">{passwordMessage}</p>}

          <div className="card-actions">
            <button className="button button-dark" disabled={isSavingPassword}>
              {isSavingPassword ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ProfilePage;
