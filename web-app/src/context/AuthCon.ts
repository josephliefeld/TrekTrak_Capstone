import { createContext } from 'react'

export interface AuthContextType {
    isLoggedIn: boolean
    setIsLoggedIn: (value: boolean) => void
    loading: boolean
    logout: () => Promise<void>
    userId: string | null
    setUserId: (id: string | null) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)