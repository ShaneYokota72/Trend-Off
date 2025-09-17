import { NextRequest, NextResponse } from "next/server";
import supabase from "@/util/supabase";
import { format, toZonedTime } from "date-fns-tz";
import { pstTimeZone } from "@/const/timezone";

export async function GET(request: NextRequest) {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const pstDate = toZonedTime(yesterday, pstTimeZone);
        const startPst = new Date(pstDate);
        const endPst = new Date(pstDate);
        startPst.setHours(0, 0, 0, 0);
        endPst.setHours(23, 59, 59, 999);
        const isoPST = format(pstDate, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone : pstTimeZone });

        const { count, error: countError } = await supabase
            .from('Entry')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startPst.toISOString())
            .lte('created_at', endPst.toISOString());

        if (countError) {
            throw new Error(countError.message);
        }

        const { data, error } = await supabase
            .from('DailyChallenge')
            .update({ total_entry: count })
            .eq('prompt_date', isoPST.split('T')[0])
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ "success": true });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}