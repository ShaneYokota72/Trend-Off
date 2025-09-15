import { NextRequest, NextResponse } from "next/server";
import supabase from "@/util/supabase";
import { toZonedTime } from "date-fns-tz";
import { pstTimeZone } from "@/const/timezone";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const uid = searchParams.get('uid') ?? '';

        if (!uid) {
            return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
        }

        const today = new Date();
        const zonedNow = toZonedTime(today, pstTimeZone);
        const startPst = new Date(zonedNow);
        const endPst = new Date(zonedNow);
        startPst.setHours(0, 0, 0, 0);
        endPst.setHours(23, 59, 59, 999);

        const { count, error } = await supabase
            .from('Entry')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startPst.toISOString())
            .lte('created_at', endPst.toISOString())
            .eq('uid', uid);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ count });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}