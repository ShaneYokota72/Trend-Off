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
        const { winnerId, loserId } = body;

        if (!winnerId || !loserId) {
            return NextResponse.json({ error: 'winnerId and loserId are required' }, { status: 400, headers: corsHeaders });
        }

        if (winnerId === loserId) {
            return NextResponse.json({ error: 'winnerId and loserId must be different' }, { status: 400, headers: corsHeaders });
        }

        // Get current ELO ratings for both canvases
        const { data: canvases, error: fetchError } = await supabase
            .from('Canvas')
            .select('id, elo')
            .in('id', [winnerId, loserId]);

        if (fetchError) {
            throw new Error(fetchError.message);
        }

        if (!canvases || canvases.length !== 2) {
            return NextResponse.json({ error: 'One or both canvas items not found' }, { status: 404 });
        }

        const winner = canvases.find(c => c.id === winnerId);
        const loser = canvases.find(c => c.id === loserId);

        if (!winner || !loser) {
            return NextResponse.json({ error: 'Invalid winner or loser ID' }, { status: 400 });
        }

        // Update ELO ratings: winner +1, loser -1
        const newWinnerElo = (winner.elo || 1000) + 1;
        const newLoserElo = Math.max((loser.elo || 1000) - 1, 0); // Don't let ELO go below 0

        // Update both records
        const { error: updateError } = await supabase
            .from('Canvas')
            .upsert([
                { id: winnerId, elo: newWinnerElo, updatedAt: new Date().toISOString() },
                { id: loserId, elo: newLoserElo, updatedAt: new Date().toISOString() }
            ]);

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({ 
            success: true,
            message: 'Vote recorded successfully',
            results: {
                winner: { id: winnerId, oldElo: winner.elo || 1000, newElo: newWinnerElo },
                loser: { id: loserId, oldElo: loser.elo || 1000, newElo: newLoserElo }
            }
        }, {
            headers: corsHeaders
        });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400, headers: corsHeaders });
    }
} 