import { AuthContext } from './AuthCon'
import { useEffect, useState } from 'react'
import { supabase } from '@/components/lib/supabase/client'

export function AuthProvider({children}: {children: React.ReactNode}) {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const checkSession = async () => {
            const {data} = await supabase.auth.getSession()
            const session = data.session
            setIsLoggedIn(!!session)
            setUserId(session?.user?.id ?? null)
            setLoading(false)
        }
        checkSession()

        const {data: listener} = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session)
            setUserId(session?.user?.id ?? null)
            setLoading(false)
        })

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    const logout = async () => {
        await supabase.auth.signOut()
        setIsLoggedIn(false)
        setUserId(null)
    }

    return (
        <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn, loading, logout, userId, setUserId,}}>
            {children}
        </AuthContext.Provider>
    )
}