import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchLogs() {
    console.log("Fetching latest system logs...");
    const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching logs:", error);
        return;
    }

    if (data.length === 0) {
        console.log("No logs found.");
    } else {
        console.table(data);
    }
}

fetchLogs();
