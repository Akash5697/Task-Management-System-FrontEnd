export default function RegisterForm({ form, loading, error, message, onChange, onSubmit }) {
  return (
    <>
      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <form className="form" onSubmit={onSubmit}>
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="John Doe"
            autoComplete="name"
            required
          />
        </label>

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
            placeholder="Create a password"
            autoComplete="new-password"
            required
          />
        </label>

        <div className="helper-text">Registration creates a normal employee account.</div>

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </>
  );
}
