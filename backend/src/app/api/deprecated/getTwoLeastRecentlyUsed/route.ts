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
        const { searchParams } = new URL(req.url);
        const excludeIdsParam = searchParams.get('excludeIds');
        
        let query = supabase
            .from('Canvas')
            .select('*')
            .order('updatedAt', { ascending: true });
            
        // If excludeIds are provided, filter them out
        if (excludeIdsParam) {
            const excludeIds = excludeIdsParam.split(',').filter(id => id.trim());
            if (excludeIds.length > 0) {
                query = query.not('id', 'in', `(${excludeIds.join(',')})`);
            }
        }
        
        const { data, error } = await query.limit(2);
            
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