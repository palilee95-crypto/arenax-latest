import { supabase } from "@arenax/database";

async function testPlayerDashboard() {
    console.log("=== Testing Player Dashboard Profile Fetch ===\n");

    const userId = 'da810e20-73be-4074-8a05-ac404f7ff4f4'; // shaiful

    console.log("Testing profile fetch WITHOUT avatar_url...");
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, role, skill_level')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("❌ FAILED:", error.message);
        return;
    }

    if (!profile) {
        console.error("❌ No profile found");
        return;
    }

    console.log("✅ SUCCESS!");
    console.log("   Name:", profile.first_name, profile.last_name);
    console.log("   Role:", profile.role);
    console.log("   Skill:", profile.skill_level);
    console.log("\n=== Player dashboard should work now! ===");
}

testPlayerDashboard();
