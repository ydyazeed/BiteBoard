import { useState } from 'react'
import { FaXmark, FaShare, FaCopy, FaCheck } from 'react-icons/fa6'

const ShareModal = ({ onClose, onShare }) => {
  const [title, setTitle] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleShare = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const link = await onShare(title || "My Wishlist")
      setShareLink(link)
    } catch (err) {
      setError('Failed to create shareable link')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cafe-brown-500 hover:text-cafe-brown-700"
        >
          <FaXmark className="text-xl" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <FaShare className="text-2xl text-cafe-brown-500" />
          <h2 className="text-2xl font-semibold text-cafe-brown-800">
            Share Your Wishlist
          </h2>
        </div>

        {!shareLink ? (
          <>
            <p className="text-cafe-brown-600 mb-4">
              Create a shareable link for your wishlist that you can send to friends and family.
            </p>

            <div className="mb-4">
              <label className="block text-cafe-brown-700 text-sm font-medium mb-2">
                Wishlist Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Favorite Cafe Dishes"
                className="w-full px-3 py-2 border border-cafe-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-brown-500"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleShare}
              disabled={isLoading}
              className="w-full bg-cafe-brown-500 text-white py-2 rounded-lg font-medium hover:bg-cafe-brown-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating Link...' : 'Create Share Link'}
            </button>
          </>
        ) : (
          <>
            <p className="text-cafe-brown-600 mb-4">
              Your shareable link is ready! Copy and share it with anyone you'd like.
            </p>

            <div className="mb-4">
              <label className="block text-cafe-brown-700 text-sm font-medium mb-2">
                Shareable Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-cafe-brown-200 rounded-lg text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-cafe-brown-500 text-white rounded-lg hover:bg-cafe-brown-600 transition-colors"
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
              {copied && (
                <p className="text-green-600 text-sm mt-1">Copied to clipboard!</p>
              )}
            </div>

            <div className="bg-cafe-brown-50 p-4 rounded-lg">
              <p className="text-cafe-brown-700 text-sm">
                <strong>Note:</strong> Anyone with this link will be able to view your wishlist. 
                The link will remain active until you delete it.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ShareModal
