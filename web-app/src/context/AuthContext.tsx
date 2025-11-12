import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/components/lib/supabase/client'

interface AuthContextType {
    isLoggedIn: boolean
    setIsLoggedIn: (value: boolean) => void
    loading: boolean
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({children}: {children: React.ReactNode}) {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkSession = async () => {
            const {data} = await supabase.auth.getSession()
            setIsLoggedIn(!!data.session)
            setLoading(false)
        }
        checkSession()

        const {data: listener} = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session)
            setLoading(false)
        })

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    const logout = async () => {
        await supabase.auth.signOut()
        setIsLoggedIn(false)
    }

    return (
        <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn, loading, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within an AuthProvider')
    return context
}