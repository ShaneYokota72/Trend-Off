import { NextResponse } from 'next/server';
import { Database } from '../../../../util/supabase-types'
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server'

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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { uid, img, title, displayName, transformedImage, productIds } = body;

        if (!img && !transformedImage) {
            return NextResponse.json({ error: 'Either img or transformedImage is required' }, { 
                status: 400,
                headers: corsHeaders 
            });
        }

        // Log the data for debugging
        console.log('Submission from user:', displayName);
        console.log('Has transformed image:', !!transformedImage);
        console.log('Product IDs:', productIds);

        // Generate UID if not provided or invalid
        let finalUid = uid;
        if (!uid || !uid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            finalUid = crypto.randomUUID();
        }

        // Check if record with this UID already exists
        const { data: existingRecord } = await supabase
            .from('Canvas')
            .select('*')
            .eq('uid', finalUid)
            .single();

        // Prepare the data for insert/update
        const recordData: any = {
            uid: finalUid,
            elo: 1000,
            updatedAt: new Date().toISOString(),
            display_name: displayName || null
        };

        // Add img if provided
        if (img) {
            recordData.img = img;
        }

        // Add title if provided
        if (title) {
            recordData.title = title;
        }

        // Add transformed image if provided
        if (transformedImage) {
            recordData.generated_image = transformedImage;
        }

        // Add product IDs if provided
        if (productIds && Array.isArray(productIds)) {
            recordData.product_ids = productIds;
        }

        let result;

        if (existingRecord) {
            // Update existing record
            console.log('Updating existing record with ID:', existingRecord.id);
            const { data, error } = await supabase
                .from('Canvas')
                .update(recordData)
                .eq('id', existingRecord.id)
                .select();

            if (error) throw error;
            result = data;
        } else {
            // Insert new record
            console.log('Inserting new record with UID:', finalUid);
            const { data, error } = await supabase
                .from('Canvas')
                .insert(recordData)
                .select();

            if (error) throw error;
            result = data;
        }

        console.log('Operation successful:', result);
        return NextResponse.json({ success: true, data: result }, {
            headers: corsHeaders
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ 
            error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }, { 
            status: 400,
            headers: corsHeaders 
        });
    }
}