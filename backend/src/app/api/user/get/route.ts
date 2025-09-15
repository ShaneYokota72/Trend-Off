import { NextRequest, NextResponse } from "next/server";
import supabase from "@/util/supabase";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id') ?? '';

        const { data, error } = await supabase
            .from("User")
            .select()
            .eq("id", id)
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