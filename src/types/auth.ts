export interface AuthUser {
  id: string
  email: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export interface Credentials {
  email: string
  password: string
}
