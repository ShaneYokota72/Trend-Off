import { NextRequest, NextResponse } from "next/server";
import supabase from "@/util/supabase";

export async function POST(req: NextRequest) {
    try {
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

        return NextResponse.json({ data });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}