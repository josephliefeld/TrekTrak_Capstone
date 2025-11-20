import { useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '@/components/lib/supabase/client'
import { useAuth } from '../context/useAuth'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { setIsLoggedIn } = useAuth()
  
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setError(null)
  
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }
      
      setIsLoggedIn(true)
      navigate('/events')
    }
  
    return (
      <form onSubmit={handleLogin} className="flex flex-col gap-2 max-w-sm mx-auto mt-10">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
        Welcome to TrekTrak!
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Log In
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    )
  }