import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaLocationDot, FaStar, FaHeart, FaRegHeart, FaXmark } from 'react-icons/fa6'
import { MdCoffeeMaker, MdRecommend } from 'react-icons/md'
import { useAuth } from './context/AuthContext'
import Wishlist from './components/Wishlist'
import AuthModal from './components/AuthModal'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [cafes, setCafes] = useState([])
  const [error, setError] = useState(null)
  const [showWishlist, setShowWishlist] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist')
    return saved ? JSON.parse(saved) : []
  })

  const { user, tokens, refreshToken } = useAuth()

  // Set up axios interceptor for authentication
  useEffect(() => {
    if (tokens?.access) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [tokens])

  // Save wishlist to localStorage when it changes
  useEffect(() => {
    if (!user) { // Only save to localStorage when user is not logged in
      localStorage.setItem('wishlist', JSON.stringify(wishlist))
    }
  }, [wishlist, user])

  // Sync with server when user logs in
  useEffect(() => {
    const syncWishlistWithServer = async () => {
      if (user && tokens) {
        try {
          // First, get the server wishlist
          const response = await axios.get('http://localhost:8000/api/wishlist/sync/')
          console.log('Server wishlist:', response.data)
          const serverWishlist = response.data

          // Get local wishlist
          const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
          console.log('Local wishlist:', localWishlist)

          // If there are local items, save them to server
          if (localWishlist.length > 0) {
            for (const item of localWishlist) {
              // Check if item already exists on server
              const exists = serverWishlist.some(
                serverItem => 
                  serverItem.dish_name === item.dish_name && 
                  serverItem.cafe_name === item.cafe_name
              )
              
              if (!exists) {
                try {
                  console.log('Saving item to server:', item)
                  const saveResponse = await axios.post('http://localhost:8000/api/wishlist/', {
                    dish_name: item.dish_name,
                    cafe_name: item.cafe_name,
                    cafe_address: item.cafe_address
                  })
                  console.log('Save response:', saveResponse.data)
                } catch (error) {
                  console.error('Failed to sync item to server:', error.response?.data || error)
                }
              }
            }
            
            // After syncing, get the updated server wishlist
            const updatedResponse = await axios.get('http://localhost:8000/api/wishlist/sync/')
            console.log('Updated server wishlist:', updatedResponse.data)
            setWishlist(updatedResponse.data)
          } else {
            // If no local items, just use server wishlist
            setWishlist(serverWishlist)
          }

          // Clear localStorage after successful sync
          localStorage.removeItem('wishlist')
        } catch (error) {
          console.error('Failed to sync wishlist:', error.response?.data || error)
        }
      }
    }

    syncWishlistWithServer()
  }, [user, tokens])

  const findNearbyCafes = async () => {
    setIsLoading(true)
    setError(null)
    setShowWishlist(false)

    try {
      // Get user's location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      // Call our API
      const response = await axios.post('http://localhost:8000/api/find-cafes/', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      })

      setCafes(response.data.cafes)
    } catch (err) {
      console.error('Error:', err)
      if (err.code === 1) { // GeolocationPositionError.PERMISSION_DENIED
        setError('Please enable location access to find nearby cafes.')
      } else if (err.response) {
        setError(err.response.data.error || 'Failed to fetch nearby cafes.')
      } else {
        setError('An error occurred while finding nearby cafes.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const addToWishlist = async (dish, cafe) => {
    const wishlistItem = {
      dish_name: dish.trim(),
      cafe_name: cafe.name,
      cafe_address: cafe.address
    }

    if (user && tokens) {
      try {
        console.log('Adding to server wishlist:', wishlistItem)
        const response = await axios.post('http://localhost:8000/api/wishlist/', wishlistItem)
        console.log('Server response:', response.data)
        setWishlist(prev => [...prev, response.data])
      } catch (error) {
        console.error('Failed to add to wishlist:', error.response?.data || error)
      }
    } else {
      setWishlist(prev => [...prev, wishlistItem])
      setShowAuthModal(true)
    }
  }

  const removeFromWishlist = async (item) => {
    if (user && tokens) {
      try {
        await axios.delete(`http://localhost:8000/api/wishlist/${item.id}/`)
        setWishlist(prev => prev.filter(i => i.id !== item.id))
      } catch (error) {
        console.error('Failed to remove from wishlist:', error.response?.data || error)
      }
    } else {
      setWishlist(prev => prev.filter(i => 
        !(i.dish_name === item.dish_name && i.cafe_name === item.cafe_name)
      ))
    }
  }

  const isInWishlist = (dish, cafeName) => {
    return wishlist.some(item => 
      item.dish_name?.trim() === dish.trim() && item.cafe_name === cafeName
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4">
            <MdCoffeeMaker className="text-4xl sm:text-5xl text-cafe-brown-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-cafe-brown-800 mb-4">BiteBoard</h1>
          <p className="text-cafe-brown-600 text-base sm:text-lg mb-8">Discover the best dishes at cafes near you</p>
          
          <button
            onClick={findNearbyCafes}
            disabled={isLoading}
            className="find-cafes-btn"
          >
            <FaLocationDot className="inline-block mr-2" />
            {isLoading ? 'Finding Cafes...' : 'Find Cafes Near Me'}
          </button>

          {error && (
            <div className="mt-4 text-red-600 bg-red-50 p-4 rounded-lg">
              {error}
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="relative">
          {/* Cafes List */}
          {!showWishlist && cafes.length > 0 && (
            <div className="grid gap-4 sm:gap-6">
              {cafes.map((cafe, index) => (
                <div key={index} className="cafe-card">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-cafe-brown-800">{cafe.name}</h2>
                    <div className="rating-badge">
                      <FaStar className="inline-block mr-1" />
                      {cafe.rating}
                    </div>
                  </div>
                  
                  <p className="text-cafe-brown-600 mb-4 text-sm sm:text-base">
                    <FaLocationDot className="inline-block mr-1" />
                    {cafe.address}
                  </p>

                  <div className="bg-cafe-brown-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MdRecommend className="text-2xl text-cafe-brown-600" />
                      <h3 className="text-lg font-medium text-cafe-brown-700">
                        AI Recommended Dishes
                      </h3>
                    </div>
                    {cafe.recommended_dishes !== "No specific dishes mentioned" && 
                     cafe.recommended_dishes !== "Error analyzing reviews" ? (
                      <div className="flex flex-wrap gap-2">
                        {cafe.recommended_dishes.split(',').map((dish, i) => {
                          const trimmedDish = dish.trim()
                          const inWishlist = isInWishlist(trimmedDish, cafe.name)
                          
                          return (
                            <div 
                              key={i} 
                              className={`flex items-center bg-white rounded-full pr-2 transition-all ${
                                inWishlist ? 'ring-2 ring-red-500' : 'hover:ring-2 hover:ring-cafe-brown-300'
                              }`}
                            >
                              <span className="py-2 px-4 text-cafe-brown-800">
                                {trimmedDish}
                              </span>
                              <button
                                onClick={() => inWishlist 
                                  ? removeFromWishlist({ dish_name: trimmedDish, cafe_name: cafe.name })
                                  : addToWishlist(trimmedDish, cafe)
                                }
                                className={`ml-1 p-2 rounded-full transition-colors ${
                                  inWishlist 
                                    ? 'text-red-500 hover:text-red-600' 
                                    : 'text-cafe-brown-400 hover:text-red-500'
                                }`}
                                title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                              >
                                {inWishlist ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-cafe-brown-500 italic">{cafe.recommended_dishes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Wishlist Panel */}
          {showWishlist && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
              <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white shadow-xl z-50 flex flex-col">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-cafe-brown-800">
                      My Wishlist
                    </h2>
                    <button
                      onClick={() => setShowWishlist(false)}
                      className="text-cafe-brown-500 hover:text-cafe-brown-700"
                    >
                      <FaXmark className="text-2xl" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <Wishlist items={wishlist} onRemoveFromWishlist={removeFromWishlist} />
                </div>

                {!user && (
                  <div className="p-4 sm:p-6 border-t border-gray-200">
                    <div className="bg-cafe-brown-50 rounded-lg p-4">
                      <p className="text-cafe-brown-700 text-center mb-3">
                        Sign in to save your wishlist and access it anywhere!
                      </p>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="w-full bg-cafe-brown-500 text-white py-2 rounded-lg font-medium hover:bg-cafe-brown-600 transition-colors"
                      >
                        Login / Sign Up
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floating Wishlist Button */}
          <button
            onClick={() => setShowWishlist(true)}
            className="fixed bottom-6 right-6 bg-cafe-brown-500 text-white p-4 rounded-full shadow-lg hover:bg-cafe-brown-600 transition-colors duration-300 z-30"
          >
            <div className="relative">
              <FaHeart className="text-2xl" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  )
}

export default App
