import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('tokens')
    return saved ? JSON.parse(saved) : null
  })

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const savedTokens = localStorage.getItem('tokens')
      if (savedTokens) {
        const parsedTokens = JSON.parse(savedTokens)
        setTokens(parsedTokens)
        
        // Set the Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedTokens.access}`
        
        try {
          // Try to refresh the token to ensure it's still valid
          await refreshToken()
          // If successful, set the user
          const savedUser = localStorage.getItem('user')
          if (savedUser) {
            setUser(JSON.parse(savedUser))
          }
        } catch (error) {
          console.error('Token refresh failed:', error)
          logout() // Clear invalid tokens
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  // Persist tokens and user data
  useEffect(() => {
    if (tokens) {
      localStorage.setItem('tokens', JSON.stringify(tokens))
    } else {
      localStorage.removeItem('tokens')
    }
  }, [tokens])

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        username,
        password
      })
      setTokens(response.data)
      setUser({ username })
      return response.data
    } catch (error) {
      throw error.response?.data || { detail: 'Login failed' }
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', {
        username,
        email,
        password
      })
      setTokens(response.data)
      setUser(response.data.user)
      return response.data
    } catch (error) {
      throw error.response?.data || { detail: 'Registration failed' }
    }
  }

  const logout = () => {
    setTokens(null)
    setUser(null)
    localStorage.removeItem('tokens')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }

  const refreshToken = async () => {
    if (!tokens?.refresh) return
    try {
      const response = await axios.post('http://localhost:8000/api/auth/refresh/', {
        refresh: tokens.refresh
      })
      setTokens(prev => ({ ...prev, access: response.data.access }))
      return response.data
    } catch (error) {
      logout()
      throw error
    }
  }

  const value = {
    user,
    tokens,
    loading,
    login,
    logout,
    register,
    refreshToken,
  }

  if (loading) {
    return null // or a loading spinner
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 