import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser, registerUser } from '../api/AuthAPI'

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
  if (f.password.length < 8) return 'Password must be at least 8 characters.'
  if (!/\d/.test(f.password)) return 'Password must contain at least one number.'
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
  const [error, setError] = useState<string | null>(null)
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
                placeholder="Min. 8 characters, at least 1 number"
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

        <p className="login-footer-link">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
  )
}