import React, { createContext, useState, useEffect } from "react";

type ImageGenerationStatus = "pre-generating" | "generating" | "completed" | "error";

interface UserData {
    uid: string;
    userName: string;
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
    // potential future additions: canvas_src, generated_img_src, 
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
    const [user, setUser] = useState<UserData | null>({ uid: "1", userName: "test user 1" }); // hardcoded for testing purposes
    const [todayPrompt, setTodayPrompt] = useState<string>("");
    const [productIds, setProductIds] = useState<string[]>([]);
    const [canvasImgSrc, setCanvasImgSrc] = useState<string>("");
    const [imageGenerationStatus, setImageGenerationStatus] = useState<ImageGenerationStatus>("pre-generating");
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");

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
        
        // TODO: make a user fetch call (when shopify integrates a hook for it)

        getPrompt();
        // TODO: call the user fetch function
    }, []);

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
        generateImage();
    }, [canvasImgSrc]);

    return (
        <TrendOffContext.Provider value={{ user, todayPrompt, productIds, setProductIds, canvasImgSrc, setCanvasImgSrc, imageGenerationStatus, setImageGenerationStatus, generatedImageUrl}}>
            {children}
        </TrendOffContext.Provider>
    );
};