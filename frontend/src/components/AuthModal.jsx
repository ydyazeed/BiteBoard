import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FaXmark } from 'react-icons/fa6'

const AuthModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(username, password)
      } else {
        await register(username, email, password)
      }
      onClose()
    } catch (err) {
      setError(err.detail || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cafe-brown-500 hover:text-cafe-brown-700"
        >
          <FaXmark className="text-xl" />
        </button>

        <h2 className="text-2xl font-semibold text-cafe-brown-800 mb-6 text-center">
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-cafe-brown-700 text-sm font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-cafe-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-brown-500"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-cafe-brown-700 text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-cafe-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-brown-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-cafe-brown-700 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-cafe-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-brown-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cafe-brown-500 text-white py-2 rounded-lg font-medium hover:bg-cafe-brown-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-cafe-brown-600 text-sm hover:text-cafe-brown-800"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthModal 