import { TopBar } from "@arenax/ui";
import { SidebarWrapper } from "../../components/SidebarWrapper";
import { supabase } from "@arenax/database";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function UserLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll().map((c: { name: string, value: string }) => `${c.name}=${c.value.substring(0, 5)}...`).join(', ');

    console.log("[WEB-ADMIN] ===== LAYOUT START =====");
    console.log("[WEB-ADMIN] Received userId:", userId);
    console.log("[WEB-ADMIN] Cookies seen by server:", allCookies);

    if (!userId) {
        redirect(`${process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'}`);
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, role')
        .eq('id', userId)
        .single();

    if (!profile) {
        console.log("[WEB-ADMIN] ❌ No profile found, redirecting to onboarding");
        const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000';
        redirect(`${authUrl}/onboarding`);
    }

    // Redirection guard
    if (profile.role !== 'admin') {
        const roleRedirects: Record<string, string> = {
            'player': process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001',
            'venue-owner': process.env.NEXT_PUBLIC_VENUE_URL || 'http://localhost:3002'
        };
        redirect(`${roleRedirects[profile.role]}/${userId}` || (process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'));
    }

    const userName = `${profile.first_name} ${profile.last_name}`;
    const userRole = profile.role;

    return (
        <div className="app-layout">
            <SidebarWrapper
                userId={userId}
                userName={userName}
                userRole={userRole}
            />
            <div className="main-wrapper">
                <TopBar
                    userId={userId}
                    userName={userName}
                    userRole={userRole}
                    statusBadge="ADMIN: ACTIVE"
                    profileHref={`/${userId}`}
                    settingsHref={`/${userId}/settings`}
                />
                <main className="app-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
