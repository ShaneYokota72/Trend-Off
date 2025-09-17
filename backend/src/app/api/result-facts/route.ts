import { NextRequest, NextResponse } from "next/server";
import supabase from "@/util/supabase";
import { format, toZonedTime } from "date-fns-tz";
import { pstTimeZone } from "@/const/timezone";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const uid = searchParams.get('uid') ?? '';

        if (!uid) {
            return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayPSTNow = toZonedTime(yesterday, pstTimeZone);
        const startPst = new Date(yesterdayPSTNow);
        startPst.setHours(0, 0, 0, 0);
        const endPst = new Date(yesterdayPSTNow);
        endPst.setHours(23, 59, 59, 999);
        const yesterdayIsoPST = format(yesterdayPSTNow, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone : pstTimeZone });

        const { data: percentile, error } = await supabase.rpc("get_entry_percentile", {
            p_uid: uid,
            p_date: yesterdayIsoPST.split('T')[0],
            start_ts: startPst.toISOString(),
            end_ts: endPst.toISOString()
        });

        const { data: streak, error: streakError } = await supabase
            .from('User')
            .select('streak')
            .eq('id', uid)
            .single();
        
        return NextResponse.json({ facts: [{
            emoji: "👏",
            subtitle: "Great Performance!",
            text: `You are in the ${percentile}th percentile!`
        }, {
            emoji: "🔥",
            subtitle: "You're on a streak!",
            text: `You have a ${streak?.streak}-day streak!`
        }] });
        
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}