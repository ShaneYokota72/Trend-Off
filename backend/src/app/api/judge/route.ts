import { NextRequest, NextResponse } from "next/server";
import supabase from "@/util/supabase";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { winnerId, loserId } = body;

        const { data, error } = await supabase.rpc('update_elo_after_vote', {
            winner_id: winnerId,
            loser_id: loserId
        })

        if (error) {
            console.log('error:', error);
            throw new Error(error.message);
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}