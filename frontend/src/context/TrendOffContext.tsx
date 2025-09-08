import React, { createContext, useState, useEffect } from "react";
import {useAsyncStorage, useCurrentUser} from '@shopify/shop-minis-react'

type ImageGenerationStatus = "pre-generating" | "generating" | "completed" | "error";

interface UserData {
    id: string;
    uid: string;
    user_name: string;
    friends: string[];
}

interface TrendOffContextType {
    user: UserData | null;
    todayPrompt: string;
    productIds: string[];
    setProductIds: (ids: string[]) => void;
    canvasImgSrc: string;
    setCanvasImgSrc: (src: string) => void;
    imageGenerationStatus: ImageGenerationStatus;
    setImageGenerationStatus: (status: ImageGenerationStatus) => void;
    generatedImageUrl: string;
}

export const TrendOffContext = createContext<TrendOffContextType>({
    user: null,
    todayPrompt: "",
    productIds: [],
    setProductIds: () => {},
    canvasImgSrc: "",
    setCanvasImgSrc: () => {},
    imageGenerationStatus: "pre-generating",
    setImageGenerationStatus: () => {},
    generatedImageUrl: "",
});

export const TrendOffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [todayPrompt, setTodayPrompt] = useState<string>("");
    const [productIds, setProductIds] = useState<string[]>([]);
    const [canvasImgSrc, setCanvasImgSrc] = useState<string>("");
    const [imageGenerationStatus, setImageGenerationStatus] = useState<ImageGenerationStatus>("pre-generating");
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
    const { getItem, setItem } = useAsyncStorage()
    const { currentUser } = useCurrentUser()

    const createUser = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_TREND_OFF_ENDPOINT}/api/user/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // uid: null, TODO: Will implement once userId is exposed from Shopify Shop
                    user_name: currentUser?.displayName
                }),
            });
    
            if (response.ok) {
                const { data } = await response.json();
                return data
            }

            throw new Error('Failed to create user');
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    }

    useEffect(() => {
        const getPrompt = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_TREND_OFF_ENDPOINT}/api/getPrompt`);
                const { data } = await response.json();
                setTodayPrompt(data.prompt || "");
            } catch (error) {
                console.error('Error fetching prompt:', error);
            }
        };
        
        getPrompt()
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const user = await getItem({key: 'userId'})
            if (user) {
                const response = await fetch(`${import.meta.env.VITE_TREND_OFF_ENDPOINT}/api/user/get?id=${user}`);
                const { data } = await response.json();
                setUser(data);
            } else {
                const user = await createUser()
                if (user && user?.id) {
                    await setItem({key: 'userId', value: user.id})
                }
            }
        }

        if(currentUser?.displayName) {
            getUser()
        }
    }, [currentUser]);

    useEffect(() => {
        // save canvas img src to db along with all other info?
        const generateImage = async () => {
            try {
                setImageGenerationStatus("generating");
                console.log('Generating image with src:', canvasImgSrc);
                const response = await fetch(`${import.meta.env.VITE_TREND_OFF_ENDPOINT}/api/generateImage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageSrc: canvasImgSrc,
                        challenge: todayPrompt,
                        prompt: ""
                    }),
                });

                if (response.ok) {
                    const { data } = await response.json();
                    console.log("img gen comp with src:", canvasImgSrc);
                    setGeneratedImageUrl(data.imageUrl || "");
                    setImageGenerationStatus("completed");
                } else {
                    console.error('Image generation failed:', response.statusText);
                    setImageGenerationStatus("error");
                }
            } catch (error) {
                console.error('Error generating image:', error);
            }
        }

        // start the img gen process
        if(canvasImgSrc !== "") generateImage();
    }, [canvasImgSrc]);

    return (
        <TrendOffContext.Provider value={{ user, todayPrompt, productIds, setProductIds, canvasImgSrc, setCanvasImgSrc, imageGenerationStatus, setImageGenerationStatus, generatedImageUrl}}>
            {children}
        </TrendOffContext.Provider>
    );
};