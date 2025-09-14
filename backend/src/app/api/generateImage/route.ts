import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageSrc, challenge, prompt } = body;

        if (!imageSrc) {
            return NextResponse.json({ error: 'image source is required' }, { status: 400 });
        }

        const promptToUse = prompt || `Generate a photo of a mannequin with the following outfit.\n\nFor some context, this image is a whiteboard for the following challenge: "${challenge}". Generate an image that would be a good submission for a review regarding this challenge.`;

        // use fal.ai (fal-ai/nano-banana/edit) for image generation
        const result = await fal.subscribe("fal-ai/nano-banana/edit", {
            input: {
                prompt: promptToUse,
                image_urls: [imageSrc],
                num_images: 1,
                output_format: "png",
                sync_mode: true
            }
        });

        return NextResponse.json({
            imageUrl: result.data.images[0].url,
            contentType: result.data.images[0].content_type
        });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}
