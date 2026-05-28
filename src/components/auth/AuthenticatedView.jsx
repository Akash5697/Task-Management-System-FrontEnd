export default function AuthenticatedView({ user, onLogout }) {
  return (
    <div className="page-shell">
      <div className="hero-card dashboard-card">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Task Management</p>
            <h1>Welcome back, {user?.name}</h1>
            <p className="muted">
              You are signed in as <strong>{user?.role}</strong>. This is a simple, responsive auth starter.
            </p>
          </div>
          <button className="secondary-button" onClick={onLogout} type="button">
            Logout
          </button>
        </div>

        <div className="profile-grid">
          <InfoCard label="Name" value={user?.name} />
          <InfoCard label="Email" value={user?.email} />
          <InfoCard label="Role" value={user?.role} />
        </div>

        <div className="notice-box">
          <h2>Next step</h2>
          <p>Connect your role-based pages here later: admin users, employee tasks, and manager task tools.</p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="info-card">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  );
}
