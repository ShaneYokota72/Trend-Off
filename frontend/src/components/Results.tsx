import { useContext, useEffect, useState } from 'react'
import {useNavigateWithTransition, NAVIGATION_TYPES, DATA_NAVIGATION_TYPE_ATTRIBUTE, Button} from '@shopify/shop-minis-react'
import { ArrowLeft, ArrowRight, Trophy, User } from 'lucide-react'
import ReactSimplyCarousel from 'react-simply-carousel';
import { TrendOffContext } from '../context/TrendOffContext';
interface Fact {
  emoji: string;
  subtitle: string;
  text: string;
}

export function Results() {
  const navigation = useNavigateWithTransition()
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [facts, setFacts] = useState<Fact[]>([]);
  const { user } = useContext(TrendOffContext);

  const handleViewWinners = async () => {
    document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.forward);
    navigation('/winners')
  }

  useEffect(() => {
    const fetchResultFacts = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_TREND_OFF_ENDPOINT}/api/result-facts?uid=${user?.id}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const result = await response.json();
          setFacts(result.facts);
        } catch (error) {
          console.error('Error fetching result facts:', error);
        }
    }
    fetchResultFacts();
  },[])

  return (
    <div className="min-h-screen bg-[#000] relative overflow-x-hidden">
      <div className="flex flex-col items-center justify-start min-h-screen pt-8 px-4 max-w-full">
        <Trophy className='w-16 h-16 mb-6 text-white'/>

        <h1 className='text-white text-center font-bold text-3xl mb-6'>
          You crushed it!
        </h1>
        {
          facts.length > 0 && (
            <p className='text-white text-center mb-6 px-4'>Here are some fun facts!</p>
          )
        }

        <ReactSimplyCarousel
          activeSlideIndex={currentCardIndex}
          onRequestChange={setCurrentCardIndex}
          itemsToShow={3}
          itemsToScroll={1}
          responsiveProps={[
            {
              itemsToShow: 3,
              minWidth: 768,
            },
          ]}
          speed={400}
          easing="linear"
          infinite={false}
        >
          {facts.length > 0 ? (
            facts.map((fact, index) => (
              <div className='px-4' key={index}>
                <div className="w-56 h-56 flex flex-col gap-2 items-center justify-center p-4 bg-[#5433EB] rounded-2xl text-white">
                  <div className="text-center text-5xl mb-4">{fact.emoji}</div>
                  <div className="text-center text-2xl font-semibold">{fact.subtitle}</div>
                  <div className="text-center">{fact.text}</div>
                </div>
              </div>
            ))
          ) : (
            <div className='px-4'>
                <div className="w-56 h-56 flex flex-col gap-2 items-center justify-center p-4 bg-[#5433EB] rounded-2xl text-white">
                  <div className="text-center text-5xl mb-4">😆</div>
                  <div className="text-center text-2xl font-semibold">Welcome Back!</div>
                  <div className="text-center">We've missed you! Time to trend off again!</div>
                </div>
              </div>
          )}
        </ReactSimplyCarousel>
        
        <div className='flex justify-between items-center gap-6 mt-4 mb-6'>
          <ArrowLeft 
            className={`w-8 h-8 text-white ${currentCardIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} 
            onClick={() => setCurrentCardIndex(currentCardIndex - 1)}
            aria-disabled={currentCardIndex === 0}
          />
          <ArrowRight 
            className={`w-8 h-8 text-white ${currentCardIndex === facts.length - 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} 
            onClick={() => setCurrentCardIndex(currentCardIndex + 1)}
            aria-disabled={currentCardIndex === facts.length - 1}
          />
        </div>

        {/* Share button */}
        {/* <div className="mb-6">
          <button className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center">
            <img src="/share.svg" alt="Share" className="w-5 h-5" />
          </button>
        </div> */}

        <div className='flex flex-col items-center justify-center gap-4 bg-white/10 w-4/5 h-fit p-2 rounded-2xl mb-8'>
          <p className='text-2xl text-white'>Coming Soon!</p>
          <div className='flex'>
            <div className='bg-[#b4a6f6] p-2 w-14 h-14 rounded-full flex items-center justify-center border border-black'>
              <User className='w-8 h-8'/>
            </div>
            <div className='-ml-2 bg-[#b4a6f6] p-2 w-14 h-14 rounded-full flex items-center justify-center border border-black'>
              <User className='w-8 h-8'/>
            </div>
            <div className='-ml-2 bg-[#b4a6f6] p-2 w-14 h-14 rounded-full flex items-center justify-center border border-black'>
              <User className='w-8 h-8'/>
            </div>
          </div>
          <p className='text-white'>X friends played</p>
        </div>

        <Button onClick={handleViewWinners} className='rounded-full !w-fit mx-auto px-4 py-2'>View Winners</Button>
      </div>
    </div>
  )
}