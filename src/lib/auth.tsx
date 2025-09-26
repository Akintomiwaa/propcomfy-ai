import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type User = { name: string; email: string; phone?: string | null }

type AuthContextType = {
  user: User | null
  signIn: (u: User) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pc_user')
      if (raw) setUser(JSON.parse(raw))
    } catch {}
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    user,
    signIn: (u) => {
      setUser(u)
      localStorage.setItem('pc_user', JSON.stringify(u))
    },
    signOut: () => {
      setUser(null)
      localStorage.removeItem('pc_user')
    },
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

