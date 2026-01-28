'use client'
import React , {ReactNode} from 'react'
import { CookiesProvider } from 'react-cookie'

export default function AppCookiesProvider({children}: { children: ReactNode}) {
  return (
    <CookiesProvider>
        {children}
    </CookiesProvider>
  )
}
