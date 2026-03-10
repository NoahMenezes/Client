'use client'

import React, { createContext, useContext } from 'react'

export interface DashboardUser {
  name: string
  email: string
  avatar?: string | null
}

const UserContext = createContext<DashboardUser | null>(null)

export function UserProvider({
  user,
  children,
}: {
  user: DashboardUser
  children: React.ReactNode
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useDashboardUser(): DashboardUser | null {
  return useContext(UserContext)
}
