import {useContext, useEffect, useState} from 'react'
import { DragEndEvent } from '@dnd-kit/core'
import { WhiteboardCanvas, WhiteboardItem } from './WhiteboardCanvas'
import { IconButton, Input, Product, ProductCard, useImageUpload, useProductSearch } from '@shopify/shop-minis-react'
import {useNavigateWithTransition, NAVIGATION_TYPES, DATA_NAVIGATION_TYPE_ATTRIBUTE} from '@shopify/shop-minis-react'
import { TrendOffContext } from '../../context/TrendOffContext'
import { CircleAlert, X } from 'lucide-react'
import { Sheet } from 'react-modal-sheet'

export function Whiteboard() {
  const [items, setItems] = useState<WhiteboardItem[]>([])
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const { todayPrompt, setCanvasImgSrc, productIds,setProductIds } = useContext(TrendOffContext)
  const { uploadImage } = useImageUpload()
  const navigation = useNavigateWithTransition()

  // Use the Shopify product search hook
  const { products, loading, error } = useProductSearch({
    query: submittedQuery,
    first: 20,
  })

  const screenShotCanvas = async (): Promise<string> => {
    const canvasElement = document.querySelector('[data-whiteboard-canvas]') as HTMLElement
    if (!canvasElement) return ''

    try {
      // Create a new canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return ''

      // Set canvas size
      canvas.width = window.innerWidth
      canvas.height = 560

      // Fill white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Get all images in the whiteboard
      const images = canvasElement.querySelectorAll('img')
      
      return new Promise<string>((resolve) => {
        let loadedImages = 0
        const totalImages = images.length

        if (totalImages === 0) {
          resolve(canvas.toDataURL('image/png'))
          return
        }

        images.forEach((img) => {
          const newImg = new Image()
          newImg.crossOrigin = 'anonymous'
          
          newImg.onload = () => {
            // Get the position from the parent div
            const parent = img.closest('[style*="position"]') as HTMLElement
            if (parent) {
              const style = parent.style
              const x = parseInt(style.left) || 0
              const y = parseInt(style.top) || 0
              const width = parseInt(style.width) || 100
              const height = parseInt(style.height) || 100
              
              ctx.drawImage(newImg, x, y, width, height)
            }
            
            loadedImages++
            if (loadedImages === totalImages) {
              resolve(canvas.toDataURL('image/png'))
            }
          }
          
          newImg.onerror = () => {
            loadedImages++
            if (loadedImages === totalImages) {
              resolve(canvas.toDataURL('image/png'))
            }
          }
          
          newImg.src = img.src
        })
      })
    } catch (error) {
      console.error('Alternative canvas capture failed:', error)
      return ''
    }
  }

  const handleGoBack = () => {
    document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.backward);
    navigation(-1)
  }

  const handleNext = async () => {
    try {
      const canvasImage = await screenShotCanvas();
      
      // Convert base64 to blob
      const base64Response = await fetch(canvasImage);
      const blob = await base64Response.blob();
      
      // Create a File object from the blob
      const file = new File([blob], 'whiteboard.png', { type: 'image/png' });
      
      const result = await uploadImage(file);

      if(result[0]?.imageUrl) setCanvasImgSrc(result[0].imageUrl)
    } catch (error) {
      console.error('Failed to capture whiteboard:', error);
    }
    
    // Navigate to judging immediately
    document.documentElement.setAttribute(DATA_NAVIGATION_TYPE_ATTRIBUTE, NAVIGATION_TYPES.forward);
    navigation('/judging');
  }

  const addImageToWhiteboard = (image: Product) => {
    const newItem: WhiteboardItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      imageUrl: image.featuredImage?.url || '',
      productId: image.id, // Store the actual product ID (or dummy ID for fallback images)
      x: 200, // Center horizontally (500px whiteboard - 100px item = 400px / 2 = 200px)
      y: 150, // Center vertically (400px whiteboard - 100px item = 300px / 2 = 150px)
      width: 100,
      height: 100
    }
    setItems(prev => [...prev, newItem])
    setProductIds([...productIds, image.id])
    setShowAddPanel(false)
    setSearchQuery('')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, delta} = event
    
    if (delta.x === 0 && delta.y === 0) return

    setItems(items => items.map(item => {
      if (item.id === active.id) {
        const newX = Math.max(0, Math.min(item.x + delta.x, window.innerWidth - 100)) // Max screen width - 100px
        const newY = Math.max(0, Math.min(item.y + delta.y, 460)) // Max 460px (560-100)
        return {
          ...item,
          x: newX,
          y: newY
        }
      }
      return item
    }))
  }

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(selectedItemId === itemId ? null : itemId)
  }

  const handleDeleteSelected = () => {
    if (selectedItemId) {
      setItems(items => items.filter(item => item.id !== selectedItemId))
      setSelectedItemId(null)
    }
  }

  // Debounce function to handle search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSubmittedQuery(searchQuery.trim());
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchQuery]);

  return (
    <div className="min-h-screen h-full bg-black flex flex-col py-8">
      <h1 className="text-2xl font-bold text-white text-center">{todayPrompt}</h1>
      <WhiteboardCanvas
        items={items}
        onDragEnd={handleDragEnd}
        selectedItemId={selectedItemId}
        onItemSelect={handleItemClick}
        handleDeleteSelected={handleDeleteSelected}
      />

      <div className="flex items-center justify-between px-6">
        <button
          onClick={handleGoBack}
          className="w-20 text-white bg-[#3E3E3E] rounded-full py-2 text-center"
        >
          Close
        </button>
        <div
          onClick={() => setShowAddPanel(true)}
          className="w-12 h-12 bg-white text-black rounded-full text-4xl flex items-center justify-center"
        >
          +
        </div>
        <button
          onClick={handleNext}
          className="w-20 text-white bg-[#5433EB] rounded-full py-2 text-center"
        >
          Next
        </button>
      </div>

      <Sheet isOpen={showAddPanel} onClose={() => {setShowAddPanel(false); setSearchQuery('')}}>
        <Sheet.Container>
          <Sheet.Content>
            <div className="bg-[#DFDFDF] p-4 h-full flex flex-col items-center">
              <div className="w-full flex justify-end">
                <IconButton 
                  Icon={X} 
                  onClick={() => {setShowAddPanel(false); setSearchQuery('')}} 
                  buttonStyles='bg-[#CECECE] rounded-full w-12 h-12 mb-4' 
                  iconStyles='h-6 w-6 text-black'
                />
              </div>

              <Input 
                placeholder="🔍 Search products" 
                value={searchQuery}
                className='w-9/10 rounded-4xl bg-white text-center'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSubmittedQuery(searchQuery);
                  }
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {
                products && products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 mt-4 w-full overflow-y-scroll">
                    {products?.map((product) => (
                      <div key={product.id} onClick={() => addImageToWhiteboard(product)}>
                        <ProductCard 
                          key={product.id}
                          product={product}
                          touchable={false}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-4/5 flex flex-col items-center justify-center">
                    {loading ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p>Searching products...</p>
                      </div>
                    ) : error ? (
                      <div className="text-center text-red-500 flex gap-2">
                        <CircleAlert />
                        <p>Error loading products.</p>
                      </div>
                    ) : submittedQuery ? (
                      <div className="text-center">
                        <p className="text-lg">No items found for "{submittedQuery}"</p>
                        <p className="text-sm mt-1 text-slate-600">Try a different search term</p>
                      </div>
                    ) : (
                      <p className="w-3/5 text-lg text-center">Search for products to add to your board</p>
                    )}
                  </div>
                )
              }
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    </div>
  )
}
