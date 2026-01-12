import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    console.log("[API delete-user] POST request received");
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Initialize Supabase Admin client with Service Role Key
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase environment variables:', {
                hasUrl: !!supabaseUrl,
                hasServiceKey: !!supabaseServiceKey
            });
            return NextResponse.json({
                error: 'Server configuration error',
                details: { hasUrl: !!supabaseUrl, hasServiceKey: !!supabaseServiceKey }
            }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Delete from profiles table first (to handle any constraints manually if needed)
        // Although with ON DELETE CASCADE on other tables, this should be smooth.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.error('Error deleting profile:', profileError);
            return NextResponse.json({ error: `Failed to delete profile: ${profileError.message}` }, { status: 500 });
        }

        // 2. Delete from Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.error('Error deleting auth user:', authError);
            return NextResponse.json({ error: `Failed to delete auth user: ${authError.message}` }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Unexpected error in delete-user API:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
    }
}
