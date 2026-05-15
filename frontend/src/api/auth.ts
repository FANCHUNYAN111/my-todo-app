import request from './request'

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: number
}

export interface RegisterResponse {
  message: string
  userId: number
}

export function loginApi(data: LoginParams) {
  return request.post<LoginParams, LoginResponse>('/api/login', data)
}

export function registerApi(data: RegisterParams) {
  return request.post<RegisterParams, RegisterResponse>('/api/register', data)
}