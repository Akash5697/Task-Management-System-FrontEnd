import { useCallback, useEffect, useState } from 'react';
import {
  fetchEmployeeProfile,
  fetchEmployeeTasks,
  updateEmployeeTaskStatus,
} from '../../services/employeeService';

export default function EmployeeDashboard({ user, token, onLogout }) {
  const [profile, setProfile] = useState(user);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [profileData, taskData] = await Promise.all([
        fetchEmployeeProfile(token),
        fetchEmployeeTasks(token),
      ]);

      setProfile(profileData.user);
      setTasks(taskData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (taskId, status) => {
    setError('');
    setMessage('');

    try {
      const updatedTask = await updateEmployeeTaskStatus(token, taskId, status);
      setTasks((current) =>
        current.map((task) => (String(task._id || task.id) === String(taskId) ? updatedTask : task)),
      );
      setMessage('Task status updated.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-shell">
      <div className="hero-card employee-dashboard">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Employee Panel</p>
            <h1>Welcome, {profile?.name}</h1>
            <p className="muted">View your profile and update the status of assigned tasks.</p>
          </div>
          <button className="secondary-button" onClick={onLogout} type="button">
            Logout
          </button>
        </div>

        {message ? <div className="alert success">{message}</div> : null}
        {error ? <div className="alert error">{error}</div> : null}

        <div className="employee-grid">
          <section className="panel-box">
            <h2>Personal Profile</h2>
            <div className="profile-list">
              <ProfileRow label="Name" value={profile?.name} />
              <ProfileRow label="Email" value={profile?.email} />
              <ProfileRow label="Role" value={profile?.role} />
            </div>
          </section>

          <section className="panel-box employee-tasks-panel">
            <div className="panel-header">
              <h2>Tasks Assigned To You</h2>
              <button className="secondary-button" type="button" onClick={loadData} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <p className="muted tasks-note">These are the tasks assigned to your account. You can only update their status.</p>

            <div className="table-wrap">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Assigned By</th>
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
                        <td>{task.createdBy?.name || '-'}</td>
                        <td>{task.priority}</td>
                        <td>
                          <select
                            value={task.status}
                            onChange={(event) => handleStatusChange(taskId, event.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                      </tr>
                    );
                  })}

                  {!loading && tasks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        No assigned tasks found.
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

function ProfileRow({ label, value }) {
  return (
    <div className="profile-row">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  );
}
