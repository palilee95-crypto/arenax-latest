import { supabase } from "@arenax/database";

async function checkAdminUsers() {
    console.log("Checking for admin users...");
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, password, role, first_name, last_name')
        .eq('role', 'admin');

    if (error) {
        console.error("Error fetching admin users:", error);
        return;
    }

    console.log("Admin users found:", data?.length || 0);
    console.table(data);
}

checkAdminUsers();
