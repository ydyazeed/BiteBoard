import { FaLocationDot, FaHeart } from 'react-icons/fa6'

const Wishlist = ({ items, onRemoveFromWishlist }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <FaHeart className="text-4xl text-cafe-brown-300 mx-auto mb-4" />
        <p className="text-cafe-brown-600">Your wishlist is empty</p>
        <p className="text-cafe-brown-400 text-sm mt-2">Save dishes you want to try later!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="bg-cafe-brown-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-medium text-cafe-brown-800">
                {item.dish_name}
              </h3>
              <p className="text-cafe-brown-600 text-sm mt-1">
                <span className="font-medium">From:</span> {item.cafe_name}
              </p>
              <p className="text-cafe-brown-500 text-sm mt-1">
                <FaLocationDot className="inline-block mr-1" />
                {item.cafe_address}
              </p>
            </div>
            <button
              onClick={() => onRemoveFromWishlist(item)}
              className="text-red-500 hover:text-red-600 transition-colors"
              title="Remove from wishlist"
            >
              <FaHeart className="text-xl" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Wishlist 