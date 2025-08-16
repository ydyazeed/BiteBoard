import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { FaLocationDot, FaHeart } from 'react-icons/fa6'
import { MdCoffeeMaker } from 'react-icons/md'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SharedWishlist = () => {
  const { shareId } = useParams()
  const [wishlistData, setWishlistData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSharedWishlist = async () => {
      try {
        console.log('Fetching shared wishlist with ID:', shareId)
        const response = await axios.get(`${API_URL}/api/shared/${shareId}/`)
        console.log('Shared wishlist data:', response.data)
        setWishlistData(response.data)
      } catch (err) {
        console.error('Error fetching shared wishlist:', err)
        if (err.response?.status === 404) {
          setError('This shared wishlist was not found or may have expired.')
        } else {
          setError('Unable to load the shared wishlist. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (shareId) {
      fetchSharedWishlist()
    }
  }, [shareId])

  if (loading) {
    return (
      <div className="min-h-screen bg-cafe-brown-50 flex items-center justify-center p-4">
        <div className="text-center">
          <MdCoffeeMaker className="text-5xl text-cafe-brown-500 mx-auto mb-4 animate-pulse" />
          <p className="text-cafe-brown-600">Loading shared wishlist...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cafe-brown-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <MdCoffeeMaker className="text-5xl text-cafe-brown-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-cafe-brown-800 mb-4">Oops!</h2>
          <p className="text-cafe-brown-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-cafe-brown-500 text-white px-6 py-2 rounded-lg hover:bg-cafe-brown-600 transition-colors"
          >
            Go to BiteBoard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cafe-brown-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MdCoffeeMaker className="text-4xl sm:text-5xl text-cafe-brown-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-cafe-brown-800 mb-2">
            {wishlistData.user_name}'s Wishlist
          </h1>
          {wishlistData.title && wishlistData.title !== `${wishlistData.user_name}'s Wishlist` && (
            <p className="text-cafe-brown-600 text-lg mb-2">
              "{wishlistData.title}"
            </p>
          )}
          <p className="text-cafe-brown-500 text-sm">
            Shared on {new Date(wishlistData.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Wishlist Items */}
        {wishlistData.wishlist_items && wishlistData.wishlist_items.length > 0 ? (
          <div className="grid gap-4 sm:gap-6">
            {wishlistData.wishlist_items.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-cafe-brown-100 rounded-full flex items-center justify-center">
                      <FaHeart className="text-cafe-brown-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-cafe-brown-800 mb-2">
                      {item.dish_name}
                    </h3>
                    <p className="text-cafe-brown-600 mb-2">
                      <span className="font-medium">From:</span> {item.cafe_name}
                    </p>
                    <p className="text-cafe-brown-500 text-sm">
                      <FaLocationDot className="inline-block mr-1" />
                      {item.cafe_address}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaHeart className="text-4xl text-cafe-brown-300 mx-auto mb-4" />
            <p className="text-cafe-brown-600">This wishlist is empty.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-cafe-brown-200">
          <p className="text-cafe-brown-600 mb-4">
            Want to create your own wishlist?
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-cafe-brown-500 text-white px-6 py-2 rounded-lg hover:bg-cafe-brown-600 transition-colors font-medium"
          >
            Try BiteBoard
          </button>
        </div>
      </div>
    </div>
  )
}

export default SharedWishlist
