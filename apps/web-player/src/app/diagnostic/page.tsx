import { supabase } from "@arenax/database";

export default async function DiagnosticPage() {
    const testUserId = "4033a353-77f5-44f0-8936-b004bc733666";

    console.log("[DIAGNOSTIC] Testing Supabase connection...");
    console.log("[DIAGNOSTIC] URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("[DIAGNOSTIC] Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, hero_url')
        .eq('id', testUserId)
        .single();

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#0a0a0c', color: 'white', minHeight: '100vh' }}>
            <h1>🔍 Diagnostic Page</h1>

            <h2>Environment Variables:</h2>
            <pre style={{ background: '#1a1a1c', padding: '1rem', borderRadius: '8px' }}>
                NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}
                {'\n'}NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET ✅' : 'NOT SET ❌'}
            </pre>

            <h2>Test Query Result:</h2>
            {error ? (
                <pre style={{ background: '#ff000020', padding: '1rem', borderRadius: '8px', color: '#ff6b6b' }}>
                    ERROR: {JSON.stringify(error, null, 2)}
                </pre>
            ) : (
                <pre style={{ background: '#00ff0020', padding: '1rem', borderRadius: '8px', color: '#51cf66' }}>
                    SUCCESS ✅
                    {'\n\n'}
                    Profile Data:
                    {'\n'}
                    {JSON.stringify(profile, null, 2)}
                    {'\n\n'}
                    Hero URL Length: {profile?.hero_url?.length || 0}
                    {'\n'}
                    Hero URL starts with data:image/: {profile?.hero_url?.startsWith('data:image/') ? 'YES' : 'NO'}
                    {'\n'}
                    Hero URL is base64: {profile?.hero_url?.startsWith('/9j/') ? 'YES (raw base64)' : 'UNKNOWN'}
                </pre>
            )}

            <h2>Deployment Info:</h2>
            <pre style={{ background: '#1a1a1c', padding: '1rem', borderRadius: '8px' }}>
                Latest Commit: ed598dd
                {'\n'}Fix: Handle base64 hero images with or without data URL prefix
                {'\n\n'}If you see this page, Vercel deployment is working!
            </pre>
        </div>
    );
}
