import React from 'react'
import { useNavigateWithTransition, NAVIGATION_TYPES, DATA_NAVIGATION_TYPE_ATTRIBUTE } from '@shopify/shop-minis-react'
import { useParams } from 'react-router'

interface Friend {
  id: string;
  name: string;
  placement: string;
  image: string;
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

export function Calendar() {
  const navigation = useNavigateWithTransition()
  const { friendId } = useParams<{ friendId: string }>()
  
  const friend = friendsData.find(f => f.id === friendId)
  
  const handleGoBack = () => {
    document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.backward);
    navigation(-1)
  }

  // Generate calendar days for August 2025
  const generateCalendarDays = () => {
    const daysInMonth = 31 // August has 31 days
    const firstDayOfWeek = 5 // August 1st, 2025 is a Friday (0=Sunday, 1=Monday, ..., 5=Friday)
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (!friend) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Friend not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-6 py-8">
      {/* Calendar */}
      <div className="w-full max-w-md mb-8">
        {/* Month/Year Header */}
        <div className="text-center mb-6">
          <h1 
            style={{
              color: '#FFF',
              fontFamily: '"Instrument Sans", sans-serif',
              fontSize: '24px',
              fontWeight: 600,
              lineHeight: 'normal'
            }}
          >
            August 2025
          </h1>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map(day => (
            <div key={day} className="text-center py-2">
              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.60)',
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: 'normal'
                }}
              >
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div key={index} className="flex justify-center items-center h-12">
              {day && (
                <div 
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full
                    ${day === 10 ? 'border-2 border-white cursor-pointer' : ''}
                  `}
                  onClick={day === 10 ? () => {
                    document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.forward);
                    navigation(`/calendar-preview/${friendId}`)
                  } : undefined}
                >
                  <span
                    style={{
                      color: '#FFF',
                      fontFamily: '"Instrument Sans", sans-serif',
                      fontSize: '16px',
                      fontWeight: day === 10 ? 600 : 400,
                      lineHeight: 'normal'
                    }}
                  >
                    {day}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex items-center gap-4 mb-8">
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
  )
}