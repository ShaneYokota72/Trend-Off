import { NextResponse } from 'next/server';
import { Database } from '../../../../util/supabase-types'
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server'
import OpenAI from "openai";

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS(request: NextRequest) {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    })
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { image, prompt } = body;

        if (!image || !prompt) {
            return NextResponse.json({ error: 'image and prompt are required' }, { status: 400 , headers: corsHeaders });
        }

        // Validate base64 image format
        if (!image.startsWith('data:image/')) {
            return NextResponse.json({ error: 'Invalid image format. Expected base64 data URL.' }, { status: 400, headers: corsHeaders });
        }

        // Convert base64 to buffer for OpenAI API
        const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Create a File object instead of Blob for better compatibility
        const imageFile = new File([imageBuffer], 'input.png', { type: 'image/png' });
        
        // Use OpenAI image edit API with gpt-image-1 model
        const response = await openai.images.edit({
            model: "gpt-image-1",
            image: imageFile,
            prompt: prompt,
            // size: "1024x1024",
            background: "auto",
            quality: "low"
        });

        if (!response.data || !response.data[0] || !response.data[0].b64_json) {
            return NextResponse.json({ error: 'Failed to generate transformed image' }, { status: 500, headers: corsHeaders });
        }

        const transformedImage = response.data[0].b64_json;

        // Convert back to data URL format
        const dataUrl = `data:image/png;base64,${transformedImage}`;
        console.log("Transformed image data URL:", dataUrl);

        return NextResponse.json({ 
            success: true, 
            originalImage: image,
            transformedImage: dataUrl,
            prompt: prompt
        }, {
            headers: corsHeaders
        });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Failed to transform image' }, { status: 400, headers: corsHeaders });
    }
}