import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthTabs from './components/auth/AuthTabs';
import AuthenticatedView from './components/auth/AuthenticatedView';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import ManagerDashboard from './components/manager/ManagerDashboard';
import ToastContainer from './components/ui/ToastContainer';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, THEME_KEY } from './constants/storageKeys';
import { getProfile, loginUser, registerUser } from './services/authService';

function App() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY) || '');
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');
  const [toasts, setToasts] = useState([]);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);
  const isDarkMode = theme === 'dark';

  const notify = useCallback((type, title, message) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, type, title, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const handleLogout = useCallback(() => {
    setToken('');
    setUser(null);
    setMessage('');
    setError('');
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkMode);
    localStorage.setItem(THEME_KEY, theme);
  }, [isDarkMode, theme]);

  useEffect(() => {
    const verifySession = async () => {
      if (!token) return;

      try {
        const profile = await getProfile(token);
        setUser(profile.user);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile.user));
      } catch {
        handleLogout();
      }
    };

    verifySession();
  }, [token, handleLogout]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await loginUser(loginForm);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      setMessage('Login successful.');
      notify('success', 'Success', 'You logged in successfully.');
    } catch (err) {
      setError(err.message);
      notify('error', 'Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await registerUser(registerForm);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      setMessage('Registration successful.');
      setMode('login');
      notify('success', 'Success', 'Account created successfully.');
    } catch (err) {
      setError(err.message);
      notify('error', 'Registration failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
    notify('success', 'Theme updated', `Switched to ${theme === 'dark' ? 'light' : 'dark'} mode.`);
  };

  let content;

  if (isAuthenticated) {
    if (user?.role === 'Admin') {
      content = <AdminDashboard user={user} token={token} onLogout={handleLogout} notify={notify} />;
    } else if (user?.role === 'Employee') {
      content = <EmployeeDashboard user={user} token={token} onLogout={handleLogout} notify={notify} />;
    } else if (user?.role === 'Manager') {
      content = <ManagerDashboard user={user} token={token} onLogout={handleLogout} notify={notify} />;
    } else {
      content = <AuthenticatedView user={user} onLogout={handleLogout} />;
    }
  } else {
    content = (
      <main className="page-shell">
        <section className="hero-card auth-panel">
          <AuthTabs mode={mode} onChangeMode={setMode} />

          {mode === 'login' ? (
            <LoginForm
              form={loginForm}
              loading={loading}
              error={error}
              message={message}
              onChange={(field, value) => setLoginForm((current) => ({ ...current, [field]: value }))}
              onSubmit={handleLogin}
            />
          ) : (
            <RegisterForm
              form={registerForm}
              loading={loading}
              error={error}
              message={message}
              onChange={(field, value) => setRegisterForm((current) => ({ ...current, [field]: value }))}
              onSubmit={handleRegister}
            />
          )}
        </section>
      </main>
    );
  }

  return (
    <div className={isDarkMode ? 'app-shell dark-theme' : 'app-shell'}>
      <button className="theme-toggle" type="button" onClick={toggleTheme}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      {content}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;
