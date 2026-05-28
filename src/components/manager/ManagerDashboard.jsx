import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  assignManagerTask,
  createManagerTask,
  deleteManagerTask,
  fetchManagerEmployees,
  fetchManagerAssignedTasks,
  fetchManagerProfile,
  fetchManagerTasks,
  updateManagerTask,
} from '../../services/managerService';

const initialTaskForm = {
  title: '',
  description: '',
  priority: 'Medium',
  dueDate: '',
};

function buildTaskDraft(task) {
  return {
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'Medium',
    status: task.status || 'Pending',
    dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : '',
  };
}

export default function ManagerDashboard({ user, token, onLogout, notify = () => {} }) {
  const [profile, setProfile] = useState(user);
  const [tasks, setTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(initialTaskForm);
  const [assignSelections, setAssignSelections] = useState({});
  const [editDrafts, setEditDrafts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return tasks;

    return tasks.filter((task) => {
      const values = [
        task.title,
        task.description,
        task.priority,
        task.status,
        task.assignedEmployee?.name,
        task.assignedEmployee?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return values.includes(query);
    });
  }, [searchQuery, tasks]);

  const filteredAssignedTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return assignedTasks;

    return assignedTasks.filter((task) => {
      const values = [
        task.title,
        task.description,
        task.priority,
        task.status,
        task.assignedEmployee?.name,
        task.assignedEmployee?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return values.includes(query);
    });
  }, [searchQuery, assignedTasks]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [profileData, taskData, assignedTaskData, employeeData] = await Promise.all([
        fetchManagerProfile(token),
        fetchManagerTasks(token),
        fetchManagerAssignedTasks(token),
        fetchManagerEmployees(token),
      ]);

      setProfile(profileData.user);
      setTasks(taskData);
      setAssignedTasks(assignedTaskData);
      setEmployees(employeeData);

      const nextDrafts = {};
      taskData.forEach((task) => {
        nextDrafts[task._id || task.id] = buildTaskDraft(task);
      });
      setEditDrafts(nextDrafts);

      const nextAssignSelections = {};
      taskData.forEach((task) => {
        nextAssignSelections[task._id || task.id] = '';
      });
      setAssignSelections(nextAssignSelections);
    } catch (err) {
      setError(err.message);
      notify('error', 'Load failed', err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await createManagerTask(token, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
      });
      setForm(initialTaskForm);
      setMessage('Task created successfully.');
      notify('success', 'Task created', 'The task was created successfully.');
      await loadData();
    } catch (err) {
      setError(err.message);
      notify('error', 'Create failed', err.message);
    }
  };

  const handleAssign = async (taskId) => {
    setMessage('');
    setError('');

    const employeeId = assignSelections[taskId];
    if (!employeeId) {
      setError('Please select an employee.');
      return;
    }

    try {
      await assignManagerTask(token, taskId, employeeId);
      setMessage('Task assigned successfully.');
      notify('success', 'Task assigned', 'Task assigned to employee successfully.');
      await loadData();
    } catch (err) {
      setError(err.message);
      notify('error', 'Assign failed', err.message);
    }
  };

  const handleTaskUpdate = async (taskId) => {
    setMessage('');
    setError('');

    try {
      const draft = editDrafts[taskId];
      if (!draft) {
        setError('Task data not found.');
        notify('error', 'Update failed', 'Task data not found.');
        return;
      }

      await updateManagerTask(token, taskId, {
        title: draft.title,
        description: draft.description,
        priority: draft.priority,
        status: draft.status,
        dueDate: draft.dueDate || undefined,
      });
      setMessage('Task updated successfully.');
      notify('success', 'Task updated', 'Task details were updated successfully.');
      await loadData();
    } catch (err) {
      setError(err.message);
      notify('error', 'Update failed', err.message);
    }
  };

  const handleDelete = async (taskId) => {
    setMessage('');
    setError('');

    try {
      await deleteManagerTask(token, taskId);
      setTasks((current) => current.filter((task) => String(task._id || task.id) !== String(taskId)));
      setAssignedTasks((current) => current.filter((task) => String(task._id || task.id) !== String(taskId)));
      setEditDrafts((current) => {
        const next = { ...current };
        delete next[taskId];
        return next;
      });
      setAssignSelections((current) => {
        const next = { ...current };
        delete next[taskId];
        return next;
      });
      setMessage('Task deleted successfully.');
      notify('success', 'Task deleted', 'Task removed from the list.');
    } catch (err) {
      setError(err.message);
      notify('error', 'Delete failed', err.message);
    }
  };

  return (
    <div className="page-shell">
      <div className="hero-card manager-dashboard">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Manager Panel</p>
            <h1>Welcome, {profile?.name}</h1>
            <p className="muted">Create tasks, assign them to employees, and update task status.</p>
          </div>
          <button className="secondary-button" onClick={onLogout} type="button">
            Logout
          </button>
        </div>

        {message ? <div className="alert success">{message}</div> : null}
        {error ? <div className="alert error">{error}</div> : null}

        <section className="panel-box search-box">
          <label>
            Search Tasks
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by title, employee, status..."
            />
          </label>
          <div className="helper-text">This filters both task lists on the page.</div>
        </section>

        <div className="manager-grid">
          <section className="panel-box">
            <h2>Create Task</h2>
            <form className="form" onSubmit={handleCreateTask}>
              <label>
                Title
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Task title"
                  required
                />
              </label>

              <label>
                Description
                <input
                  type="text"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Task description"
                />
              </label>

              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>

              <label>
                Due Date
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                />
              </label>

              <button className="primary-button" type="submit">
                Create Task
              </button>
            </form>
          </section>

          <section className="panel-box">
            <h2>Your Profile</h2>
            <div className="profile-list">
              <ProfileRow label="Name" value={profile?.name} />
              <ProfileRow label="Email" value={profile?.email} />
              <ProfileRow label="Role" value={profile?.role} />
            </div>
          </section>
        </div>

        <section className="panel-box manager-tasks-block">
          <div className="panel-header">
            <h2>Tasks Created By You</h2>
            <button className="secondary-button" type="button" onClick={loadData} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="table-wrap">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Edit Task</th>
                  <th>Assign Employee ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const taskId = task._id || task.id;
                  const draft = editDrafts[taskId] || buildTaskDraft(task);
                  return (
                    <tr key={taskId}>
                      <td>
                        <div className="task-title">{task.title}</div>
                        <div className="task-subtext">{task.description || 'No description'}</div>
                      </td>
                      <td>{task.assignedEmployee?.name || '-'}</td>
                      <td>
                        <div className="task-edit-stack">
                          <input
                            type="text"
                            value={draft.title}
                            onChange={(event) =>
                              setEditDrafts((current) => ({
                                ...current,
                                [taskId]: { ...draft, title: event.target.value },
                              }))
                            }
                            placeholder="Title"
                          />
                          <input
                            type="text"
                            value={draft.description}
                            onChange={(event) =>
                              setEditDrafts((current) => ({
                                ...current,
                                [taskId]: { ...draft, description: event.target.value },
                              }))
                            }
                            placeholder="Description"
                          />
                          <select
                            value={draft.priority}
                            onChange={(event) =>
                              setEditDrafts((current) => ({
                                ...current,
                                [taskId]: { ...draft, priority: event.target.value },
                              }))
                            }
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                          <input
                            type="date"
                            value={draft.dueDate}
                            onChange={(event) =>
                              setEditDrafts((current) => ({
                                ...current,
                                [taskId]: { ...draft, dueDate: event.target.value },
                              }))
                            }
                          />
                          <select
                            value={draft.status}
                            onChange={(event) =>
                              setEditDrafts((current) => ({
                                ...current,
                                [taskId]: { ...draft, status: event.target.value },
                              }))
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <select
                          value={assignSelections[taskId] || ''}
                          onChange={(event) =>
                            setAssignSelections((current) => ({ ...current, [taskId]: event.target.value }))
                          }
                        >
                          <option value="">Select employee</option>
                          {employees.map((employee) => (
                            <option key={employee._id || employee.id} value={employee._id || employee.id}>
                              {employee.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="action-stack">
                        <button className="secondary-button" type="button" onClick={() => handleTaskUpdate(taskId)}>
                          Update
                        </button>
                        <button className="secondary-button" type="button" onClick={() => handleAssign(taskId)}>
                          Assign
                        </button>
                        <button className="danger-button" type="button" onClick={() => handleDelete(taskId)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {!loading && filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No matching tasks found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel-box manager-tasks-block">
          <h2>Assigned Tasks</h2>
          <div className="table-wrap">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignedTasks.map((task) => {
                  const taskId = task._id || task.id;
                  return (
                    <tr key={taskId}>
                      <td>{task.title}</td>
                      <td>{task.assignedEmployee?.name || '-'}</td>
                      <td>{task.status}</td>
                      <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                    </tr>
                  );
                })}

                {!loading && filteredAssignedTasks.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      No matching assigned tasks found.
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

function ProfileRow({ label, value }) {
  return (
    <div className="profile-row">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  );
}
