
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jrbwlxblkpqmzeqorvno.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Wb7kDRQn2pKOTXrLcGQCtQ_hl10z6II';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkPlayerImages() {
    console.log("Checking player images in database...");

    // Fetch specifically the players in the screenshot
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, hero_url')
        .eq('role', 'player')
        .limit(20);

    if (error) {
        console.error("Error fetching profiles:", error);
        return;
    }

    profiles.forEach(p => {
        const name = `${p.first_name} ${p.last_name}`;
        console.log(`\n--- Player: ${name} ---`);
        console.log(`ID: ${p.id}`);
        console.log(`Avatar URL starts with: ${p.avatar_url ? p.avatar_url.substring(0, 50) + "..." : "NULL"}`);
        console.log(`Hero URL starts with: ${p.hero_url ? p.hero_url.substring(0, 50) + "..." : "NULL"}`);
        if (p.hero_url) {
            console.log(`Hero URL length: ${p.hero_url.length}`);
            // Check if it's already a data URL
            if (p.hero_url.startsWith('data:')) {
                console.log(`Hero URL is ALREADY a data URL.`);
            } else if (p.hero_url.startsWith('http')) {
                console.log(`Hero URL is a full URL.`);
            } else {
                console.log(`Hero URL appears to be RAW BASE64 or a path.`);
            }
        }
    });
}

checkPlayerImages();
