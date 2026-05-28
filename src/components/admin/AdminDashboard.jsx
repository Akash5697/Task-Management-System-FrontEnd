import { useCallback, useEffect, useState } from 'react';
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminTaskStatistics,
  fetchAdminTasks,
  fetchAdminUsers,
  updateAdminUserRole,
} from '../../services/adminService';

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
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [userData, statsData, taskData] = await Promise.all([
        fetchAdminUsers(token),
        fetchAdminTaskStatistics(token),
        fetchAdminTasks(token),
      ]);
      setUsers(userData);
      setStats(statsData);
      setTasks(taskData);
    } catch (err) {
      setError(err.message);
      notify('error', 'Load failed', err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

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
      await loadDashboard();
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
      await loadDashboard();
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
      await loadDashboard();
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

        <section className="stats-grid">
          <StatCard label="Total Tasks" value={stats?.totalTasks ?? 0} />
          <StatCard label="Assigned" value={stats?.assignedTasks ?? 0} />
          <StatCard label="Unassigned" value={stats?.unassignedTasks ?? 0} />
          <StatCard label="Pending" value={stats?.byStatus?.pendingTasks ?? 0} />
          <StatCard label="In Progress" value={stats?.byStatus?.inProgressTasks ?? 0} />
          <StatCard label="Completed" value={stats?.byStatus?.completedTasks ?? 0} />
        </section>

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
              <button className="secondary-button" type="button" onClick={loadDashboard} disabled={loading}>
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

        <section className="panel-box admin-tasks-panel">
          <div className="panel-header">
            <h2>All Tasks</h2>
            <button className="secondary-button" type="button" onClick={loadDashboard} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="table-wrap">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assigned To</th>
                  <th>Created By</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const taskId = task._id || task.id;
                  return (
                    <tr key={taskId}>
                      <td>
                        <div className="task-title">{task.title}</div>
                        <div className="task-subtext">{task.description || 'No description'}</div>
                      </td>
                      <td>{task.assignedEmployee?.name || '-'}</td>
                      <td>{task.createdBy?.name || '-'}</td>
                      <td>{task.priority}</td>
                      <td>{task.status}</td>
                      <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                    </tr>
                  );
                })}

                {!loading && tasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      No tasks found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
