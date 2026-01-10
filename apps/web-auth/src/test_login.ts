import { supabase } from "@arenax/database";

async function testPlayerLogin() {
    console.log("=== Testing Player Login Flow ===\n");

    // Step 1: Test database connection
    console.log("1. Testing database connection...");
    const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

    if (testError) {
        console.error("❌ Database connection FAILED:", testError.message);
        return;
    }
    console.log("✅ Database connection OK\n");

    // Step 2: Test player login credentials
    console.log("2. Testing player credentials (shaiful@gmail.com)...");
    const { data: loginData, error: loginError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'shaiful@gmail.com')
        .eq('password', '123')
        .single();

    if (loginError) {
        console.error("❌ Login query FAILED:", loginError.message);
        return;
    }

    if (!loginData) {
        console.error("❌ No user found with these credentials");
        return;
    }

    console.log("✅ User found:", loginData.first_name, loginData.last_name);
    console.log("   Role:", loginData.role);
    console.log("   User ID:", loginData.id);
    console.log("");

    // Step 3: Test profile fetch (simulating player dashboard)
    console.log("3. Testing profile fetch for player dashboard...");
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, role, skill_level, avatar_url')
        .eq('id', loginData.id)
        .single();

    if (profileError) {
        console.error("❌ Profile fetch FAILED:", profileError.message);
        return;
    }

    if (!profileData) {
        console.error("❌ Profile not found");
        return;
    }

    console.log("✅ Profile fetched successfully");
    console.log("   Name:", profileData.first_name, profileData.last_name);
    console.log("   Role:", profileData.role);
    console.log("   Skill:", profileData.skill_level);
    console.log("");

    console.log("=== ALL TESTS PASSED ===");
    console.log("Database queries work correctly.");
    console.log("Issue must be in routing/redirection logic.");
}

testPlayerLogin();
