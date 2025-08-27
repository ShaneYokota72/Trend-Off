import { Product } from '@shopify/shop-minis-react'

const RowComponent = ({ products, animationStyle }: { products: Product[], animationStyle: string }) => {
    const yDiff = (Math.random()*2-1)*25

    return (
        <div className="w-full inline-flex flex-nowrap-x-hidden">
            <ul className={`flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none ${animationStyle}`}>
                {
                    products.map((product, index) => {
                        const src = product.featuredImage?.url
                        const alt = product.featuredImage?.altText || product.title
                        return (
                            <li key={index} className="relative">
                                <img 
                                    src={src} 
                                    alt={alt} 
                                    className={`m-2 w-28 h-28 object-cover rounded-lg shadow-lg`} 
                                    style={{
                                        transform: `translate(0px, ${yDiff}px)`
                                    }}
                                />
                            </li>
                        )
                    })
                }
            </ul>
            <ul className={`flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none ${animationStyle}`} aria-hidden="true">
                {
                    products.map((product, index) => {
                        const src = product.featuredImage?.url
                        const alt = product.featuredImage?.altText || product.title
                        return (
                            <li key={index} className="relative">
                                <img 
                                    src={src} 
                                    alt={alt} 
                                    className={`m-2 w-28 h-28 object-cover rounded-lg shadow-lg`} 
                                    style={{
                                        transform: `translate(0px, ${yDiff}px)`
                                    }}
                                />
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    )
}

export default function SlidingItems({ products }: { products: Product[] }) {
  return (
    <div className='flex flex-col gap-12 h-full w-full justify-center'>
        {
            products.length && (
                <>
                    <RowComponent products={products.slice(0, 2)} animationStyle="animate-infinite-scroll-1" />
                    <RowComponent products={products.slice(2, 4)} animationStyle="animate-infinite-scroll-2" />
                    <RowComponent products={products.slice(4, 6)} animationStyle="animate-infinite-scroll-3" />
                    <RowComponent products={products.slice(6, 8)} animationStyle="animate-infinite-scroll-4" />
                </>
            )
        }
    </div>
  )
}