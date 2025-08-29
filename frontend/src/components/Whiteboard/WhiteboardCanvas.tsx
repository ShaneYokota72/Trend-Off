import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  useDraggable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { IconButton } from '@shopify/shop-minis-react';
import { clsx } from 'clsx';
import { Trash2 } from 'lucide-react';

export interface WhiteboardItem {
  id: string
  imageUrl: string
  productId: string  // Add this to track the actual Shopify product ID
  x: number
  y: number
  width: number
  height: number
}

interface WhiteboardCanvasProps {
  items: WhiteboardItem[]
  onDragEnd: (event: DragEndEvent) => void
  selectedItemId: string | null
  onItemSelect: (itemId: string) => void
  handleDeleteSelected: () => void
}

// Simplified Draggable Item Component
function DraggableItem({
  item,
  selected,
  onSelect,
}: {
  item: WhiteboardItem
  selected: boolean
  onSelect: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: item.id,
  })

  // Use CSS transform for drag offset, but keep absolute positioning for base position
  const style = {
    position: 'absolute' as const,
    left: item.x,
    top: item.y,
    width: item.width,
    height: item.height,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : selected ? 10 : 1,
    transition: isDragging ? 'none' : 'all 200ms ease',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onSelect(item.id)}
      className={clsx(
        'cursor-grab active:cursor-grabbing rounded-lg border-2 overflow-hidden bg-white',
        {
          'border-blue-500 shadow-2xl scale-105': isDragging,
          'border-purple-500 ring-2 ring-purple-300 shadow-lg': selected && !isDragging,
          'border-gray-300 hover:border-blue-400 hover:shadow-lg': !selected && !isDragging,
        }
      )}
    >
      <img
        src={item.imageUrl}
        key={item.id}
        alt="Outfit item"
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
        style={{
          borderRadius: '6px',
        }}
      />
    </div>
  )
}

export function WhiteboardCanvas({ items, onDragEnd, selectedItemId, onItemSelect, handleDeleteSelected }: WhiteboardCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  return (
    <div className="relative flex-1 flex items-start justify-center my-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <div 
          data-whiteboard-canvas
          className="relative bg-white rounded-lg shadow-lg border-2 border-gray-200 select-none overflow-hidden"
          style={{ width: '100%', height: '560px' }}
        >
          <div className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded z-10">
            Items: {items.length}
          </div>

          {items.map(item => (
            <DraggableItem
              key={item.id}
              item={item}
              selected={selectedItemId === item.id}
              onSelect={onItemSelect}
            />
          ))}
          
          {items.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
              <div className="text-center">
                <div className="text-4xl mb-2">👕</div>
                <p className="text-sm">Add items to create your outfit</p>
                <p className="text-xs mt-2 text-gray-300">Click + button below to get started</p>
              </div>
            </div>
          )}
        </div>
      </DndContext>
      {selectedItemId && (
        <IconButton Icon={Trash2} onClick={handleDeleteSelected} buttonStyles='absolute left-1/2 transform -translate-x-1/2 z-20 bottom-12 bg-red-500'/>
      )}
    </div>
  )
} 