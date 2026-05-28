export default function AuthTabs({ mode, onChangeMode }) {
  return (
    <div className="tabs" role="tablist" aria-label="Authentication form switcher">
      <button
        className={mode === 'login' ? 'tab active' : 'tab'}
        onClick={() => onChangeMode('login')}
        type="button"
        role="tab"
        aria-selected={mode === 'login'}
      >
        Login
      </button>
      <button
        className={mode === 'register' ? 'tab active' : 'tab'}
        onClick={() => onChangeMode('register')}
        type="button"
        role="tab"
        aria-selected={mode === 'register'}
      >
        Register
      </button>
    </div>
  );
}
