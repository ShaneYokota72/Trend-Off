import React, { useEffect, useState } from 'react'
import { useNavigateWithTransition, NAVIGATION_TYPES, DATA_NAVIGATION_TYPE_ATTRIBUTE } from '@shopify/shop-minis-react'
import { useParams } from 'react-router'
import CanvasImageView from './CanvasImageView'

interface Friend {
  id: string;
  name: string;
  placement: string;
  image: string;
}

interface SubmissionData {
  id: string;
  display_name: string;
  img: string;
  title: string;
  updated_at: string;
  transformed_image?: string;
}

const friendsData: Friend[] = [
  {
    id: '1',
    name: 'Daniel Kim',
    placement: 'Placed top 3%',
    image: '/daniel.svg'
  },
  {
    id: '2',
    name: 'Shane Yokota',
    placement: 'Placed top 68%',
    image: '/shane.svg'
  },
  {
    id: '3',
    name: 'Sunny Jayaram',
    placement: 'Placed top 10%',
    image: '/sunny.svg'
  },
  {
    id: '4',
    name: 'Allie Speers',
    placement: 'Placed top 32%',
    image: '/allie.svg' 
  },
  {
    id: '5',
    name: 'Harley Zhang',
    placement: 'Placed top 58%',
    image: '/harley.svg' 
  }
];

export function CalendarPreview() {
  const navigation = useNavigateWithTransition()
  const { friendId } = useParams<{ friendId: string }>()
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const friend = friendsData.find(f => f.id === friendId)

  useEffect(() => {
    const fetchSeventhMostRecent = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://shop-mini-hack-tau.vercel.app/api/getSeventh')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        
        // The getSeventh API returns the 7th most recent record directly
        if (result.data && result.data.length > 0) {
          setSubmissionData(result.data[0])
        } else {
          setError('No submission data available')
        } 
      } catch (error) {
        console.error('Error fetching submission data:', error)
        setError('Failed to load submission data')
      } finally {
        setLoading(false)
      }
    }

    fetchSeventhMostRecent()
  }, [])

  const handleGoBack = () => {
    document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.backward);
    navigation(-1)
  }

  if (!friend) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Friend not found</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading submission...</div>
      </div>
    )
  }

  if (error || !submissionData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">{error || 'No submission data available'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Canvas Image View */}
      <div className="flex-1 flex flex-col items-center">
        <CanvasImageView
          canvasImage={submissionData.img}
          genImage={submissionData.transformed_image || submissionData.img}
        />
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center px-6 py-20">
        {/* Date */}
        <div className="mb-2">
          <span
            style={{
              color: '#FFF',
              textAlign: 'center',
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal'
            }}
          >
            August 10, 2025
          </span>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={friend.image}
            alt={friend.name}
            className="w-[42px] h-[42px] rounded-full object-cover"
          />
          <div>
            <div
              style={{
                color: '#FFF',
                fontFamily: '"Instrument Sans", sans-serif',
                fontSize: '20px',
                fontWeight: 400,
                lineHeight: 'normal'
              }}
            >
              {friend.name}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={handleGoBack}
          style={{
            width: '95px',
            height: '32px',
            borderRadius: '20px',
            background: '#3E3E3E',
            border: 'none',
            color: '#FFF',
            textAlign: 'center',
            fontFamily: '"Instrument Sans", sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Back
        </button>
      </div>
    </div>
  )
} 