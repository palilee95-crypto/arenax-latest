
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlayerImages() {
    console.log("Checking player images in database...");

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, hero_url, role')
        .eq('role', 'player')
        .limit(10);

    if (error) {
        console.error("Error fetching profiles:", error);
        return;
    }

    console.table(profiles.map(p => ({
        name: `${p.first_name} ${p.last_name}`,
        avatar_prefix: p.avatar_url ? p.avatar_url.substring(0, 30) + "..." : "NULL",
        hero_prefix: p.hero_url ? p.hero_url.substring(0, 30) + "..." : "NULL"
    })));
}

checkPlayerImages();
