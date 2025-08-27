export type SelectedCard = "left" | "right" | null

export default function JudgeCard({
    imageSrc,
    title,
    handleJudged,
    isLeft,
    selection = null,
}: {
    imageSrc: string,
    title: string,
    handleJudged: (item: number) => void,
    isLeft: boolean,
    selection: SelectedCard,
}) {
  const isSelected = (selection != null && (selection === "left" && isLeft || selection === "right" && !isLeft))

  const handleClick = () => {
    handleJudged(isLeft ? 1 : 2)
  }

  return (
    <div 
      className={`w-full p-3 flex flex-col items-center rounded-xl transition-all duration-500 ease-out ${isSelected && 'bg-green-400/20 border-2 border-green-400/50 scale-105 shadow-lg shadow-green-400/20'}`}
      onClick={handleClick}
    >
      <div className='w-full h-auto aspect-[9/13] rounded-2xl bg-gray-800/50 relative overflow-hidden'>
        <img src={imageSrc} alt={title} className={`w-full h-auto aspect-[9/13] rounded-2xl object-cover transition-all duration-500 ${isSelected ? 'brightness-110' : 'brightness-75'}`} onClick={handleClick}/>
      </div>
      
      <p className={`text-lg text-center font-medium my-4 h-14 flex items-center transition-all duration-500 ${isSelected ? 'text-green-400' : 'text-white'}`}>{title}</p>
    </div>
  )
}
