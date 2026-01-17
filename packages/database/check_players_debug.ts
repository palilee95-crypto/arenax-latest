
import { createClient } from '@supabase/supabase-js';

// Hardcoded keys from check_hero.ts
const SUPABASE_URL = 'https://jrbwlxblkpqmzeqorvno.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Wb7kDRQn2pKOTXrLcGQCtQ_hl10z6II';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSpecificPlayers() {
    console.log("Checking profiles for specific players...");

    // Names from the screenshot
    const searchNames = ['Adib', 'Fahri', 'Fazli'];

    for (const name of searchNames) {
        console.log(`\nSearching for: ${name}`);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, hero_url, avatar_url')
            .ilike('first_name', `%${name}%`);

        if (error) {
            console.error(`Error searching for ${name}:`, error.message);
            continue;
        }

        if (data && data.length > 0) {
            data.forEach(p => {
                console.log(`FOUND: ${p.first_name} ${p.last_name} (${p.id})`);
                console.log(`  - Avatar: ${p.avatar_url ? (p.avatar_url.substring(0, 30) + (p.avatar_url.length > 30 ? '...' : '')) : 'NULL'}`);
                console.log(`  - Hero:   ${p.hero_url ? (p.hero_url.substring(0, 30) + (p.hero_url.length > 30 ? '...' : '')) : 'NULL'}`);

                if (p.hero_url) {
                    console.log(`  - Hero Length: ${p.hero_url.length}`);
                    console.log(`  - Hero data type: ${p.hero_url.startsWith('data:') ? 'Data URL' : (p.hero_url.startsWith('http') ? 'HTTP URL' : 'Raw String')}`);
                }
            });
        } else {
            console.log(`No players found with name containing "${name}"`);
        }
    }
}

checkSpecificPlayers();
