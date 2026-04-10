import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser, registerUser, initiateGoogleLogin } from '../api/AuthAPI'

type Tab = 'login' | 'register'

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

function validate(form: LoginForm | RegisterForm, tab: Tab): string | null {
  if (tab === 'login') {
    const f = form as LoginForm
    if (!f.email.trim()) return 'Email is required.'
    if (!f.email.includes('@')) return 'Please enter a valid email address.'
    if (!f.password) return 'Password is required.'
    return null
  }

  const f = form as RegisterForm
  if (!f.firstName.trim()) return 'First name is required.'
  if (!f.lastName.trim()) return 'Last name is required.'
  if (!f.email.trim()) return 'Email is required.'
  if (!f.email.includes('@') || !f.email.includes('.')) return 'Please enter a valid email address.'
  if (!f.password) return 'Password is required.'
  if (f.password.length < 14) return 'Password must be at least 14 characters.'
  if (f.password !== f.confirmPassword) return 'Passwords do not match.'
  return null
}

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshAuthSession } = useAuth()

  const redirectTo = searchParams.get('redirect') ?? '/'
  const tabParam = searchParams.get('tab')

  const [tab, setTab] = useState<Tab>(tabParam === 'register' ? 'register' : 'login')
  const externalError = searchParams.get('externalError')
  const [error, setError] = useState<string | null>(externalError)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  })

  const [regForm, setRegForm] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [rememberMe, setRememberMe] = useState(true)

  function switchTab(next: Tab) {
    setTab(next)
    setError(null)
    setSuccess(null)
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const err = validate(loginForm, 'login')
    if (err) {
      setError(err)
      return
    }

    setLoading(true)

    try {
      await loginUser(loginForm.email, loginForm.password, rememberMe)
      await refreshAuthSession()
      navigate(redirectTo)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const err = validate(regForm, 'register')
    if (err) {
      setError(err)
      return
    }

    setLoading(true)

    try {
      await registerUser(regForm.email, regForm.password)

      setSuccess('Account created successfully. Please sign in.')
      setTab('login')
      setLoginForm({
        email: regForm.email,
        password: '',
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <Link to="/" className="login-card__logo">
            Luz De Vida
          </Link>
          <h1 className="login-card__title">
            {tab === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="login-card__subtitle">
            {tab === 'login'
              ? 'Sign in to your account'
              : 'Join us and support our mission'}
          </p>
        </div>

        <div className="login-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'login'}
            className={`login-tab${tab === 'login' ? ' is-active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'register'}
            className={`login-tab${tab === 'register' ? ' is-active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="login-alert login-alert--error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="login-alert login-alert--success" role="status">
            {success}
          </div>
        )}

        {tab === 'login' && (
          <form className="login-form" onSubmit={handleLogin} noValidate>
            <div className="login-field">
              <label htmlFor="login-email" className="login-label">Email address</label>
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password" className="login-label">Password</label>
              <input
                id="login-password"
                type="password"
                className="login-input"
                placeholder="Your password"
                value={loginForm.password}
                onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
                required
              />
            </div>

            <label className="login-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              Keep me signed in
            </label>

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form className="login-form" onSubmit={handleRegister} noValidate>
            <div className="login-row">
              <div className="login-field">
                <label htmlFor="reg-first" className="login-label">First name</label>
                <input
                  id="reg-first"
                  type="text"
                  className="login-input"
                  placeholder="Jane"
                  value={regForm.firstName}
                  onChange={e => setRegForm(f => ({ ...f, firstName: e.target.value }))}
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="reg-last" className="login-label">Last name</label>
                <input
                  id="reg-last"
                  type="text"
                  className="login-input"
                  placeholder="Doe"
                  value={regForm.lastName}
                  onChange={e => setRegForm(f => ({ ...f, lastName: e.target.value }))}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="reg-email" className="login-label">Email address</label>
              <input
                id="reg-email"
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={regForm.email}
                onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="reg-password" className="login-label">Password</label>
              <input
                id="reg-password"
                type="password"
                className="login-input"
                placeholder="Min. 14 characters"
                value={regForm.password}
                onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="reg-confirm" className="login-label">Confirm password</label>
              <input
                id="reg-confirm"
                type="password"
                className="login-input"
                placeholder="Repeat your password"
                value={regForm.confirmPassword}
                onChange={e => setRegForm(f => ({ ...f, confirmPassword: e.target.value }))}
                autoComplete="new-password"
                required
              />
            </div>

            <p className="login-hint">
              By creating an account you'll be added as a supporter and receive updates on our mission.
            </p>

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="login-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="login-google-btn"
          onClick={() => initiateGoogleLogin(redirectTo)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {tab === 'login' ? 'Continue with Google' : 'Sign up with Google'}
        </button>

        <p className="login-footer-link">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
  )
}