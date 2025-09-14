import { useState, useContext } from 'react'
import { useCurrentUser } from '@shopify/shop-minis-react'
import {useNavigateWithTransition, NAVIGATION_TYPES, DATA_NAVIGATION_TYPE_ATTRIBUTE} from '@shopify/shop-minis-react'
import CanvasImageView from './CanvasImageView'
import { TrendOffContext } from '../context/TrendOffContext'

export function Submission() {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigateWithTransition()
  const { user, productIds, canvasImgSrc, imageGenerationStatus, generatedImageUrl} = useContext(TrendOffContext)

  // Get current user from Shopify Shop Minis
  const { currentUser } = useCurrentUser()

  const handleGoBack = () => {
    document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.backward);
    navigation(-1)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`${import.meta.env.VITE_TREND_OFF_ENDPOINT}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user?.id || 'anonymous',
          user_name: currentUser?.displayName || 'Unknown User',
          title: title.trim(),
          canvas_src: canvasImgSrc,
          gen_img_src: generatedImageUrl,
          product_ids: productIds
        }),
      });

      if (response.ok) {
        // Navigate to results page
        document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.forward);
        navigation('/results');
      } else {
        const errorData = await response.json();
        console.error('Submission failed:', errorData);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = title.trim() && canvasImgSrc && generatedImageUrl

  if (imageGenerationStatus !== 'completed') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center text-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium">Generating image...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <CanvasImageView
        canvasImage={canvasImgSrc}
        genImage={generatedImageUrl}
      />

      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="max-w-md">
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title here..."
            className="w-full px-4 py-3 my-2 text-xl text-center border border-gray-600 rounded-lg focus:ring-0 focus:ring-slate-200 focus:border-slate-200 transition-colors bg-gray-700 text-white placeholder-gray-400"
            autoFocus
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={handleGoBack}
            className="w-20 text-white bg-[#3E3E3E] rounded-full py-2 text-center"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-20 text-white bg-[#5433EB] rounded-full py-2 text-center"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}