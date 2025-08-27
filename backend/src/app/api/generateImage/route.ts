import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import OpenAI, { toFile } from "openai";
import supabase from "@/util/supabase";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageSrc, challenge, prompt } = body;

        if (!imageSrc) {
            return NextResponse.json({ error: 'image source is required' }, { status: 400 });
        }
        const promptToUse = prompt || `Generate a photorealistic image of everything that is used in this whiteboard. For some context, this whiteboard is for the following challenge: ${challenge}. Generate an image that makes it easy to understand the concepts being discussed.`;

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const imageResponse = await fetch(imageSrc);
        if (!imageResponse.ok) {
            return NextResponse.json({ error: 'Failed to fetch image from URL' }, { status: 400 });
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        const imageFile = await toFile(Buffer.from(imageBuffer), `image.png`, { type: "image/png" });

        const response = await openai.images.edit({
            model: "gpt-image-1",
            image: imageFile,
            prompt: promptToUse,
            background: "auto",
            quality: "low"
        });

        if (!response.data || !response.data[0] || !response.data[0].b64_json) {
            return NextResponse.json({ error: 'Failed to generate transformed image' }, { status: 500 });
        }

        const transformedImage = response.data[0].b64_json;

        const { data: temp1, error:temp2 } = await supabase.storage.createBucket('generated_images', {
            public: true,
            allowedMimeTypes: ['image/png'],
        })

        const imageId = imageSrc.match(/shop-app-user-content\/([^.]+)\.png/)?.[1] || Date.now().toString();
        const { data, error } = await supabase.storage
            .from('generated_images')
            .upload(`public/${imageId}.png`, transformedImage)
        console.log('supabase upload error:', error);
        console.log('supabase upload data:', data);

        // // Convert back to data URL format
        // const dataUrl = `data:image/png;base64,${transformedImage}`;
        // console.log("Transformed image data URL:", dataUrl);

        return NextResponse.json({
            imageUrl: data?.path
        });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}