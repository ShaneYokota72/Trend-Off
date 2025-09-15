import { NextRequest, NextResponse } from "next/server";
import supabase from "@/util/supabase";
import { toZonedTime } from "date-fns-tz";
import { pstTimeZone } from "@/const/timezone";

export async function GET(request: NextRequest) {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const zonedNow = toZonedTime(yesterday, pstTimeZone);
        const startPst = new Date(zonedNow);
        const endPst = new Date(zonedNow);
        startPst.setHours(0, 0, 0, 0);
        endPst.setHours(23, 59, 59, 999);
        
        const { data, error } = await supabase
            .from("Entry")
            .select("id, title, canvas_src, gen_img_src")
            .gte('created_at', startPst.toISOString())
            .lte('created_at', endPst.toISOString())
            .order('elo', { ascending: false })
            .limit(3);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}