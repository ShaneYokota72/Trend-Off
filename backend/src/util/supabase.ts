import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

let supabaseInstance: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> => {
    if (!supabaseInstance) {
        // Use server-side environment variables (without NEXT_PUBLIC_ prefix)
        const supabaseUrl = process.env.SUPABASE_URL || null;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || null;
        
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase environment variables');
        }
        
        supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    
    return supabaseInstance;
};

export const supabase = getSupabaseClient();
export default supabase;