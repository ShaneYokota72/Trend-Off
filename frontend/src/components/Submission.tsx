import React, { useState, useEffect, useContext } from 'react'
import { useCurrentUser } from '@shopify/shop-minis-react'
import {useNavigateWithTransition, NAVIGATION_TYPES, DATA_NAVIGATION_TYPE_ATTRIBUTE} from '@shopify/shop-minis-react'
import CanvasImageView from './CanvasImageView'
import { TrendOffContext } from '../context/TrendOffContext'

export function Submission() {
  const [title, setTitle] = useState('')
  // const [canvasImage, setCanvasImage] = useState<string>('')
  // const [genImage, setGenImage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isCanvasView, setIsCanvasView] = useState(true)
  const navigation = useNavigateWithTransition()
  const { canvasImgSrc, imageGenerationStatus, generatedImageUrl} = useContext(TrendOffContext)

  // Get current user from Shopify Shop Minis
  const { currentUser } = useCurrentUser()

  // useEffect(() => {
  //   console.log('Submission component mounted')
    
  //   // Get the canvas image from sessionStorage
  //   const localCanvasImage = sessionStorage.getItem('canvasImage')
  //   const localGenImage = sessionStorage.getItem('genImage')
    
  //   if (localCanvasImage) {
  //     setCanvasImage(localCanvasImage)
  //     console.log('Canvas image set in state')
  //   } else {
  //     console.error('No image found in sessionStorage')
  //   }
  //   if (localGenImage) {
  //     setGenImage(localGenImage)
  //     console.log('Generated image set in state')
  //   } else {
  //     console.error('No generated image found in sessionStorage')
  //   }
  // }, [])

  const handleGoBack = () => {
    document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.backward);
    navigation(-1)
  }

  // Generate a proper UUID v4
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // const handleFinalSubmit = async () => {
  //   if (!title.trim() || !canvasImage) return

  //   setIsSubmitting(true)
  //   setSubmitError(null)

  //   try {
  //     // Get product IDs from sessionStorage
  //     const storedProductIds = sessionStorage.getItem('productIds')
  //     const productIds = storedProductIds ? JSON.parse(storedProductIds) : []

  //     const response = await fetch('http://localhost:8080/api/submit', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         uid: generateUUID(),
  //         img: canvasImage,
  //         title: title.trim(),
  //         displayName: currentUser?.displayName || 'Anonymous User',
  //         transformedImage: genImage || null,
  //         productIds: productIds // Add product IDs to submission
  //       })
  //     })

  //     if (!response.ok) {
  //       const errorData = await response.json()
  //       throw new Error(errorData.error || 'Submission failed')
  //     }

  //     const result = await response.json()
  //     console.log('Submission successful:', result)

  //     // Clean up stored data after successful submission
  //     sessionStorage.removeItem('canvasImage')
  //     sessionStorage.removeItem('genImage')
  //     sessionStorage.removeItem('generationStatus')
  //     sessionStorage.removeItem('productIds')

  //     // Navigate directly to results page (skip judging since it's already done)
  //     document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.forward);
  //     navigation('/results')
  //   } catch (error) {
  //     console.error('Submission error:', error)
  //     setSubmitError(error instanceof Error ? error.message : 'Failed to submit. Please try again.')
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  const isFormValid = title.trim() && canvasImgSrc && generatedImageUrl

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Content */}
      {/* <div className='flex mx-auto text-white text-2xl font-semibold gap-24'>
        <p onClick={() => setIsCanvasView(true)} className={`${isCanvasView ? '' : 'text-slate-400'}`}>Canvas</p>
        <p onClick={() => setIsCanvasView(false)} className={`${!isCanvasView ? '' : 'text-slate-400'}`}>Image</p>
      </div>

      <div className='text-white mt-4'>
        {isCanvasView ? (
          <img 
            src={canvasImage} 
            alt="Canvas creation" 
            className="mx-auto w-[85%] rounded-3xl aspect-[9/13] object-cover"
          />
        ) : (
          <img 
            src={genImage} 
            alt="Generated creation" 
            className="mx-auto w-[85%] rounded-3xl aspect-[9/13] object-cover"
          />
        )}
      </div> */}

      <CanvasImageView
        canvasImage={canvasImgSrc}
        genImage={generatedImageUrl}
      />

      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title here..."
            className="w-full px-4 py-3 my-2 text-xl text-center border border-gray-600 rounded-lg focus:ring-0 focus:ring-slate-200 focus:border-slate-200 transition-colors bg-gray-700 text-white placeholder-gray-400"
            autoFocus
          />

          <div className="bg-black border-t border-gray-800 pb-8">
            <div className="flex items-center justify-between space-x-4 mt-6">
              <button
                onClick={handleGoBack}
                className="text-white bg-[#3E3E3E] rounded-full py-2 px-4"
              >
                Close
              </button>
              <button
                // onClick={handleFinalSubmit}
                onClick={() => {}}
                disabled={!isFormValid}
                className="text-white bg-[#5433EB] rounded-full py-2 px-4"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Submit Button */}
          {/* <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`w-full font-medium py-3 px-6 rounded-lg transition-all duration-300 ${
              isFormValid 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transform hover:scale-105 active:scale-95' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Preview & Submit
          </button> */}
        </div>

      </div>
    </div>
  )
}