import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthTabs from './components/auth/AuthTabs';
import AuthenticatedView from './components/auth/AuthenticatedView';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './constants/storageKeys';
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
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);

  const handleLogout = useCallback(() => {
    setToken('');
    setUser(null);
    setMessage('');
    setError('');
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }, []);

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
    } catch (err) {
      setError(err.message);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    if (user?.role === 'Admin') {
      return <AdminDashboard user={user} token={token} onLogout={handleLogout} />;
    }

    return <AuthenticatedView user={user} onLogout={handleLogout} />;
  }

  return (
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

export default App;
