export default function LoginForm({ form, loading, error, message, onChange, onSubmit }) {
  return (
    <>
      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <form className="form" onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange('email', event.target.value)}
            placeholder="john@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => onChange('password', event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </label>

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </>
  );
}
