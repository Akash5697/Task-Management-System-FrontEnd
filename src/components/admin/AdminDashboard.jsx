import { useCallback, useEffect, useState } from 'react';
import { createAdminUser, deleteAdminUser, fetchAdminUsers, updateAdminUserRole } from '../../services/adminService';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'Employee',
};

export default function AdminDashboard({ user, token, onLogout, notify = () => {} }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err.message);
      notify('error', 'Load failed', err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await createAdminUser(token, form);
      setForm(initialForm);
      setMessage('User created successfully.');
      notify('success', 'User created', 'A new user was created successfully.');
      await loadUsers();
    } catch (err) {
      setError(err.message);
      notify('error', 'Create failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId, nextRole) => {
    setError('');
    setMessage('');

    try {
      await updateAdminUserRole(token, userId, nextRole);
      setMessage('Role updated successfully.');
      notify('success', 'Role updated', 'The user role was changed successfully.');
      await loadUsers();
    } catch (err) {
      setError(err.message);
      notify('error', 'Update failed', err.message);
    }
  };

  const handleDelete = async (userId) => {
    setError('');
    setMessage('');

    try {
      await deleteAdminUser(token, userId);
      setMessage('User deleted successfully.');
      notify('success', 'User deleted', 'The user was removed successfully.');
      await loadUsers();
    } catch (err) {
      setError(err.message);
      notify('error', 'Delete failed', err.message);
    }
  };

  return (
    <div className="page-shell">
      <div className="hero-card admin-dashboard">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Admin Panel</p>
            <h1>Welcome, {user?.name}</h1>
            <p className="muted">Manage users, assign roles, and keep the system organized.</p>
          </div>
          <button className="secondary-button" onClick={onLogout} type="button">
            Logout
          </button>
        </div>

        {message ? <div className="alert success">{message}</div> : null}
        {error ? <div className="alert error">{error}</div> : null}

        <div className="admin-grid">
          <section className="panel-box">
            <h2>Create User</h2>
            <form className="form" onSubmit={handleCreateUser}>
              <label>
                Name
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="john@example.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Create password"
                  required
                />
              </label>

              <label>
                Role
                <select
                  value={form.role}
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                </select>
              </label>

              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </section>

          <section className="panel-box admin-users-panel">
            <div className="panel-header">
              <h2>All Users</h2>
              <button className="secondary-button" type="button" onClick={loadUsers} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div className="table-wrap">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item._id || item.id}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>
                        <select
                          value={item.role}
                          onChange={(event) => handleRoleChange(item._id || item.id, event.target.value)}
                        >
                          <option value="Employee">Employee</option>
                          <option value="Manager">Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="danger-button"
                          type="button"
                          onClick={() => handleDelete(item._id || item.id)}
                          disabled={String(item._id || item.id) === String(user?._id || user?.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!loading && users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        No users found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
