import { NextRequest, NextResponse } from "next/server";
import supabase from "@/util/supabase";
import { toZonedTime } from "date-fns-tz";
import { pstTimeZone } from "@/const/timezone";

export async function GET(req: NextRequest) {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const zonedNow = toZonedTime(yesterday, pstTimeZone);
        const startPst = new Date(zonedNow);
        const endPst = new Date(zonedNow);
        startPst.setHours(0, 0, 0, 0);
        endPst.setHours(23, 59, 59, 999);

        const { data, error } = await supabase.rpc("get_two_candidates", {
            start_ts:startPst.toISOString(),
            end_ts: endPst.toISOString()
        });

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}