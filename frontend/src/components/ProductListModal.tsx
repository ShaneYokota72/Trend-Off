import React from 'react'
import { ProductCard } from '@shopify/shop-minis-react'
import { useProduct } from '@shopify/shop-minis-react'

interface ProductListModalProps {
  productIds: string[]
  isOpen: boolean
  onClose: () => void
}

interface ProductDisplayProps {
  productId: string
}

// Component to display a single product
function ProductDisplay({ productId }: ProductDisplayProps) {
  const { product, loading, error } = useProduct({ id: productId })

  if (loading) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-400 text-sm text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div>Product unavailable</div>
        </div>
      </div>
    )
  }

  return (
    <ProductCard 
      product={product} 
      onFavoriteToggled={(productId, isFavorited) => {
        console.log('Favorite toggled:', productId, isFavorited)
      }}
    />
  )
}

export function ProductListModal({ productIds, isOpen, onClose }: ProductListModalProps) {
  if (!isOpen) return null

  // Filter out dummy IDs (from fallback images)
  const validProductIds = productIds.filter(id => !id.startsWith('dummy') && id.startsWith('gid://'))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div 
        className="bg-white rounded-t-2xl w-full max-w-md mx-4 mb-0 transform animate-slide-up"
        style={{ maxHeight: '80vh' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            Close
          </button>
          <h3 className="font-medium text-gray-900">Products Used</h3>
          <div className="w-12" /> {/* Spacer for centering */}
        </div>

        {/* Products List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {validProductIds.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-lg font-medium mb-2">No products to show</p>
              <p className="text-sm text-gray-500">This outfit was created with sample images</p>
            </div>
          ) : (
            <div className="space-y-4">
              {validProductIds.map(productId => (
                <ProductDisplay key={productId} productId={productId} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
} 
