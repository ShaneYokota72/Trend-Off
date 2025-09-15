import { useEffect, useState } from 'react'
import CanvasImageView from './CanvasImageView'
import { ProductListModal } from './ProductListModal'
import {useNavigateWithTransition, NAVIGATION_TYPES, DATA_NAVIGATION_TYPE_ATTRIBUTE} from '@shopify/shop-minis-react'

export default function Winner() {
  const navigation = useNavigateWithTransition()
  const [winners, setWinners] = useState<any[]>([])
  const [winnerInView, setWinnerInView] = useState<number>(0)
  const [showProductModal, setShowProductModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        console.log('Fetching winners...')
        setLoading(true)
        setError(null)
        
        const response = await fetch(`${import.meta.env.VITE_TREND_OFF_ENDPOINT}/api/winners`);
        const data = await response.json()
        
        setWinners(data.data)
      } catch (error) {
        console.error('Error fetching winners:', error)
        setError(error instanceof Error ? error.message : 'Failed to load winners')
      } finally {
        setLoading(false)
      }
    }
    fetchWinners()
  },[])

  const handleNextWinner = () => {
    if(winnerInView >= 3) {
      document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.forward);
      navigation('/results')
      return
    }
    setWinnerInView(winnerInView + 1)
  }

  const handlePreviousWinner = () => {
    if(winnerInView <= 0) {
      document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.backward);
      navigation('/results')
      return
    }
    setWinnerInView(winnerInView - 1)
  }

  const handleViewProducts = () => {
    setShowProductModal(true)
  }

  const currentWinner = winners[winnerInView]

  // Show error state
  if (error) {
    return (
      <div className='min-h-screen bg-[#0D0D0D] px-2 text-white flex flex-col items-center justify-center'>
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Winners</h1>
          <p className="text-gray-300 mb-6 max-w-md">{error}</p>
          <button 
            onClick={() => navigation('/results')}
            className="text-white bg-[#5433EB] rounded-full py-2 px-4"
          >
            Go Back to Results
          </button>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-[#0D0D0D] px-2 text-white flex flex-col items-center justify-center'>
        <div className="flex flex-col items-center justify-center h-full py-32">
          <svg className="animate-spin h-12 w-12 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span className="text-lg text-gray-300">Loading winners...</span>
        </div>
      </div>
    )
  }

  // Show empty state if no winners
  if (winners.length === 0) {
    return (
      <div className='min-h-screen bg-[#0D0D0D] px-2 text-white flex flex-col items-center justify-center'>
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-2xl font-bold mb-4">No Winners Yet</h1>
          <p className="text-gray-300 mb-6">Create some outfits and vote to see winners!</p>
          <button 
            onClick={() => navigation('/results')}
            className="text-white bg-[#5433EB] rounded-full py-2 px-4"
          >
            Go Back to Results
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className='min-h-screen bg-[#0D0D0D] px-2 text-white'>
      <CanvasImageView 
        canvasImage={currentWinner.canvas_src} 
        genImage={currentWinner.gen_img_src}
      />
      <p className='text-4xl font-semibold mt-8 text-center'>
        {
          winnerInView === 0 
            ? '🥇' 
            : winnerInView === 1 
              ? '🥈'
              : '🥉'
        }
        {currentWinner.title}
      </p>

      <div className="fixed bottom-0 left-0 right-0 p-6">
        <div className="flex items-center justify-between mb-0">
          <button
            onClick={handlePreviousWinner}
            
            className="w-20 text-white bg-[#3E3E3E] rounded-full py-2 text-center"
          >
            Back
          </button>
          <button 
            onClick={handleViewProducts}
            className="w-32 text-black bg-[#FFF] rounded-full py-2 text-center"
          >
            View Products
          </button>
          <button
            onClick={handleNextWinner}
            className="w-20 text-white bg-[#5433EB] rounded-full py-2 text-center"
          >
            {
              winnerInView >= 2
                ? 'Done'
                : 'Next'
            }
          </button>
        </div>
      </div>

      {/* Product List Modal */}
      {/* <ProductListModal
        productIds={currentWinner.product_ids || []}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
      /> */}
    </div>
  )
}
