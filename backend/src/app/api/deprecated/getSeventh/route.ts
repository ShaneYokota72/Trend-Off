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

export async function GET(req: NextRequest) {
    try {
        const { data, error } = await supabase
            .from('Canvas')
            .select('*')
            .order('updatedAt', { ascending: false }) // Most recent first
            .range(6, 6) // Get the 7th record (0-indexed, so 6th index)
            
        if (error) {
            throw new Error(error.message);
        }
        
        return NextResponse.json({data}, {
            headers: corsHeaders
        });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400, headers: corsHeaders });
    }
} 