import { NextRequest, NextResponse } from "next/server";
import supabase from "@/util/supabase";

export async function POST(req: NextRequest) {
    try {
        const { userName } = await req.json();

        const { data, error } = await supabase
            .from("User")
            .insert({ user_name: userName })
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