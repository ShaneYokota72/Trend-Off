import { NextRequest, NextResponse } from "next/server";
import supabase from "@/util/supabase";

export async function POST(req: NextRequest) {
    try {
        const { user_name } = await req.json();

        const { data, error } = await supabase
            .from("User")
            .insert({ user_name: user_name })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        console.log('User created:', data);
        console.log('User creation error:', error);

        return NextResponse.json({ data });
    } catch (error) {
        console.log('error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}