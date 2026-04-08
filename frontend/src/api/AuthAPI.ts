const BASE = 'https://luzdevidabackend-aegdcxe9grhucsfm.francecentral-01.azurewebsites.net/api/auth'

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  email: string
  displayName: string
  role: string
  userId: number
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message ?? 'Something went wrong. Please try again.')
  }
  return data as T
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: payload.firstName,
      lastName:  payload.lastName,
      email:     payload.email,
      password:  payload.password,
    }),
  })
  return handleResponse<AuthResponse>(res)
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email:    payload.email,
      password: payload.password,
    }),
  })
  return handleResponse<AuthResponse>(res)
}
