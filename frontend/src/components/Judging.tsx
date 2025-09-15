import { useContext, useEffect, useState } from "react"
import JudgeCard, { SelectedCard } from "./JudgeCard"
import { useNavigateWithTransition, NAVIGATION_TYPES, DATA_NAVIGATION_TYPE_ATTRIBUTE } from '@shopify/shop-minis-react'
import { TrendOffContext } from "../context/TrendOffContext"

type JudgingItem = {
  "id": string, 
  "title": string, 
  "gen_img_src": string
}

// Loading Spinner Component
const LoadingSpinner = ({ todayPrompt }: { todayPrompt: string }) => (
  <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center text-white">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-lg font-medium">Loading {todayPrompt}...</p>
  </div>
)

export function Judging() {
  const navigation = useNavigateWithTransition()
  const [judgeItems, setJudgeItems] = useState<JudgingItem[]>([])
  const [judgedCount, setJudgedCount] = useState<number>(0)
  const [totalJudgeCount, setTotalJudgeCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selection, setSelection] = useState<SelectedCard>(null)
  const { todayPrompt } = useContext(TrendOffContext)

  useEffect(() => {
    const getJudgeItems = async () => {
      setIsLoading(true)
      const response = await fetch(`${import.meta.env.VITE_TREND_OFF_ENDPOINT}/api/getJudgingOptions`)
      const data = await response.json()
      if (data.data.length < 2) { // not enough items to judge (0 or 1)
        document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.forward);
        navigation('/submission')
        setIsLoading(false)
        return
      }
      setJudgeItems(data.data)
      setTotalJudgeCount(Math.floor(data.data.length / 2))
      setIsLoading(false)
    }

    getJudgeItems()
  }, [])

  const handleJudged = async (chosenItem: Number) => {
    console.log('Chosen item:', chosenItem)
    if (chosenItem === 0) { // "Too tough to choose" case
      setSelection(null)
      await new Promise(resolve => setTimeout(resolve, 250));

      if (judgedCount + 1 >= totalJudgeCount) {
        document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.forward);
        navigation('/submission')
      } else {
        setJudgedCount(judgedCount + 1)
      }
    }

    setSelection(chosenItem === 1 ? "left" : "right")
    console.log('stopping for 750ms for animation')
    await new Promise(resolve => setTimeout(resolve, 750));
    console.log('resuming after delay')

    // judge api call
    await fetch(`${import.meta.env.VITE_TREND_OFF_ENDPOINT}/api/judge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        winnerId: chosenItem === 1 ? judgeItems[judgedCount*2 + 0].id : judgeItems[judgedCount*2 + 1].id,
        loserId: chosenItem === 1 ? judgeItems[judgedCount*2 + 1].id : judgeItems[judgedCount*2 + 0].id
      })
    })

    // go next page or next judge
    if (judgedCount + 1 >= totalJudgeCount) {
      // while(imageGenerationStatus !== 'completed') {
      //   await new Promise(resolve => setTimeout(resolve, 1000));
      // }
      document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.forward);
      navigation('/submission')
    } else {
      setJudgedCount(judgedCount + 1)
    }

    // Reset states and fade in new items
    setSelection(null)
  }

  if (isLoading) {
    return <LoadingSpinner todayPrompt={todayPrompt}/>
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] px-2 text-white">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white text-center mt-12">
          {todayPrompt}
        </h1>
        <div className="mt-2 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">{judgedCount + 1}/{totalJudgeCount}</span>
            <div className="flex gap-1">
              {[...Array(totalJudgeCount)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i < judgedCount ? 'bg-[#5433EB]' : 'bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-center transition-all duration-300 opacity-100 scale-100`}>
          <JudgeCard
            title={judgeItems[0]?.title || "Loading..."}
            handleJudged={handleJudged}
            imageSrc={judgeItems[judgedCount*2 + 0]?.gen_img_src || "https://via.placeholder.com/150"}
            isLeft={true}
            selection={selection}
          />

          <div className="min-h-[400px] h-max w-[2px] rounded-full bg-white/30 mx-4" />

          <JudgeCard
            title={judgeItems[1]?.title || "Loading..."}
            handleJudged={handleJudged}
            imageSrc={judgeItems[judgedCount*2 + 1]?.gen_img_src || "https://via.placeholder.com/150"}
            isLeft={false}
            selection={selection}
          />
        </div>

        <button
          onClick={() => handleJudged(0)}
          className={`mt-8 text-white bg-[#3E3E3E] rounded-full py-2 px-4 transition-all duration-200 hover:bg-[#4E4E4E] active:scale-95`}
        >
          Too tough
        </button>
      </div>
    </div>
  )
}