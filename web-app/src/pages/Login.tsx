import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { supabase } from '@/components/lib/supabase/client'
import { useAuth } from '../context/useAuth'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { setIsLoggedIn } = useAuth()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setIsLoggedIn(true)
    navigate('/events')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">
            Trek Trak
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-20">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6"
        >
          {/* Title */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Log In</h2>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com*"
              className="w-full rounded-xl border border-gray-300 px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-blue-500/60
                         transition"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password*"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12
                           focus:outline-none focus:ring-2 focus:ring-blue-500/60
                           transition"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 transition"
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.047.16-2.055.457-3.003M3.172 3.172l17.656 17.656M9.88 9.88a3 3 0 104.243 4.243"
                    />
                  </svg>
                ) : (
                  // Eye icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition
              ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            New to Trek Trak?{' '}
            <Link
              to="/signup"
              className="text-blue-600 font-medium hover:underline"
            >
              Create an account
            </Link>
          </p>
        </form>
      </main>
    </div>
  )
}
