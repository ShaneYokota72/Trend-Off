import { NextRequest, NextResponse } from "next/server";
import supabase from "@/util/supabase";
import { pstTimeZone } from "@/const/timezone";
import { format, toZonedTime } from "date-fns-tz";

export async function POST(req: NextRequest) {
    try {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const todayPSTNow = toZonedTime(today, pstTimeZone);
        const yesterdayPSTNow = toZonedTime(yesterday, pstTimeZone);
        const startPst = new Date(yesterdayPSTNow);
        startPst.setHours(0, 0, 0, 0);
        const endPst = new Date(yesterdayPSTNow);
        endPst.setHours(23, 59, 59, 999);
        const todayIsoPST = format(todayPSTNow, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone : pstTimeZone });
        const yesterdayIsoPST = format(yesterdayPSTNow, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone : pstTimeZone });
        
        const { 
            uid, 
            user_name, 
            title, 
            canvas_src,
            gen_img_src, 
            product_ids 
        } = await req.json();

        const { data, error } = await supabase
            .from("Entry")
            .insert({ 
                uid, 
                user_name, 
                title, 
                canvas_src, 
                gen_img_src, 
                product_ids 
            });

        if (error) {
            throw new Error(error.message);
        }

        const { data: newStreak, error: updateError } = await supabase.rpc("update_user_streak", {
            p_uid: uid,
            p_yesterday: yesterdayIsoPST.split('T')[0],
            p_today: todayIsoPST.split('T')[0],
        });

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}