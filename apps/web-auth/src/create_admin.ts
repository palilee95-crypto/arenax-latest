import { supabase } from "@arenax/database";

async function createAdminUser() {
    console.log("Creating admin user...");

    const adminData = {
        id: crypto.randomUUID(),
        first_name: 'Admin',
        last_name: 'Super',
        email: 'admin@arenax.com',
        password: '123',
        role: 'admin',
        nationality: 'Malaysian',
        state: 'Kuala Lumpur',
        district: 'Bukit Bintang',
        status: 'verified'
    };

    const { data, error } = await supabase
        .from('profiles')
        .insert([adminData])
        .select();

    if (error) {
        console.error("Error creating admin user:", error);
        return;
    }

    console.log("✅ Admin user created successfully!");
    console.log("Email: admin@arenax.com");
    console.log("Password: 123");
    console.log("User ID:", data[0].id);
    console.table(data);
}

createAdminUser();
