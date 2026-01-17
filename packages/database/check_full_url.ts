
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jrbwlxblkpqmzeqorvno.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Wb7kDRQn2pKOTXrLcGQCtQ_hl10z6II';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkFullUrl() {
    const { data } = await supabase
        .from('profiles')
        .select('hero_url')
        .ilike('first_name', '%Adib%')
        .single();

    if (data) {
        console.log("Full Hero URL:", data.hero_url);
    }
}

checkFullUrl();
