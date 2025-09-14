import { NextRequest, NextResponse } from "next/server";
import supabase from "@/util/supabase";
import { format, toZonedTime } from 'date-fns-tz';
import { pstTimeZone } from "@/const/timezone";

export async function GET(req: NextRequest) {
    try {
        // get the PST timezoned date
        const pstDate = toZonedTime(new Date(), pstTimeZone);
        const isoPST = format(pstDate, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone : pstTimeZone });
        console.log('pstDate:', pstDate);
        console.log('isoPST:', isoPST);

        const { data, error } = await supabase
            .from('DailyChallenge')
            .select('prompt, image_gen_prompt')
            .eq('prompt_date', isoPST.split('T')[0])
            .single();
        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}