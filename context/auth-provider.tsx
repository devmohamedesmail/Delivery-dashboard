'use client'

import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'
import { config } from '@/constants/config'
import { getErrorMessage } from '@/helper/get-error'
import { useCookies } from 'react-cookie'

interface User {
  id: number
  name: string
  email:string,
  phone:string,
  role?: {
    id: number
    role: string
  }
}

interface LoginResponse {
  success: boolean
  message?: string
  user?: User
}

interface AuthContextType {
  user: User | null
  login: (emailOrPhone: string, password: string) => Promise<LoginResponse>
  register: (name: string, identifier: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [_, setCookie] = useCookies(["access_token"]);

  const login = async (emailOrPhone: string, password: string) => {
    try {

      // Determine if it's an email or phone number
      const isEmail = emailOrPhone.includes('@')
      const payload = isEmail
        ? { email: emailOrPhone, password }
        : { phone: emailOrPhone, password }

      const res = await axios.post(`${config.API_URL}/auth/login`, payload)
      const userData = res.data.user
      const { user, token } = res.data;
      setUser(user)
      localStorage.setItem('user', JSON.stringify(user))
      setCookie("access_token", token)
      return {
        success: true,
        user: userData
      }
    } catch (error) {
      return { success: false, message: getErrorMessage(error) }
    }
  }

  const register = async (name: string, identifier: string, password: string) => {
    try {
      const res = await axios.post(`${config.API_URL}/auth/register`, {
        name,
        identifier,
        password
      })
      setUser(res.data.user)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      return { success: true }
    } catch (error) {
      return { success: false, message: getErrorMessage(error) }
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
