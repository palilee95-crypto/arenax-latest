
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jrbwlxblkpqmzeqorvno.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Wb7kDRQn2pKOTXrLcGQCtQ_hl10z6II';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

    const tableData = profiles.map(p => ({
        name: `${p.first_name} ${p.last_name}`,
        avatar_prefix: p.avatar_url ? (p.avatar_url.substring(0, 50) + (p.avatar_url.length > 50 ? "..." : "")) : "NULL",
        hero_prefix: p.hero_url ? (p.hero_url.substring(0, 50) + (p.hero_url.length > 50 ? "..." : "")) : "NULL"
    }));

    console.table(tableData);
}

checkPlayerImages();
