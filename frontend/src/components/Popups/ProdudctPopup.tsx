import { IconButton, Product, ProductLink, useProducts } from '@shopify/shop-minis-react';
import { Sheet } from 'react-modal-sheet';
import { X, CircleAlert } from 'lucide-react'

export default function ProdudctPopup({
    showPopUp,
    setShowPopUp,
    productIds,
}: {
    showPopUp: boolean;
    setShowPopUp: (show: boolean) => void;
    productIds: string[];
}) {
    const { products, loading, error } = useProducts({ ids: productIds })

    return (
        <Sheet isOpen={showPopUp} onClose={() => {setShowPopUp(false)}}>
            <Sheet.Container>
                <Sheet.Content>
                    <div className="bg-[#DFDFDF] p-4 h-full flex flex-col items-center">
                        <div className="w-full flex justify-end">
                            <IconButton 
                            Icon={X} 
                            onClick={() => {setShowPopUp(false)}} 
                            buttonStyles='bg-[#CECECE] rounded-full w-12 h-12 mb-2' 
                            iconStyles='h-6 w-6 text-black'
                            />
                        </div>
                        
                        <h2 className='text-2xl font-semibold'>Products</h2>

                        {
                            products && products.length > 0 ? (
                                <div className="flex flex-col gap-4 mt-4 w-full overflow-y-scroll">
                                    {products?.map((product: Product) => (
                                        <ProductLink product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-4/5 flex flex-col items-center justify-center">
                                    {loading ? (
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                            <p>loading...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="text-center text-red-500 flex gap-2">
                                            <CircleAlert />
                                            <p>Error loading products.</p>
                                        </div>
                                    ) : (
                                        null
                                    )}
                                </div>
                            )
                        }
                    </div>
                </Sheet.Content>
            </Sheet.Container>
            <Sheet.Backdrop />
        </Sheet>
    )
}
