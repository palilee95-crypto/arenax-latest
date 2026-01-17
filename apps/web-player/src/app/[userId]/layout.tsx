import { TopBar } from "@arenax/ui";
import { SidebarWrapper } from "../../components/SidebarWrapper";
import { supabase, getProfileImageUrl } from "@arenax/database";
import { redirect } from "next/navigation";
import { CreateMatchProvider } from "../../contexts/CreateMatchContext";
import { unstable_noStore as noStore } from 'next/cache';
import { NotificationHandler } from "../../components/NotificationHandler";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function UserLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ userId: string }>;
}) {
    noStore();
    const { userId } = await params;



    try {

        const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, role, skill_level, avatar_url, hero_url')
            .eq('id', userId)
            .single();



        if (!profile) {

            const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000';
            redirect(`${authUrl}/onboarding`);
        }

        // Session validation: Ensure URL userId matches authenticated user via cookie
        const cookieStore = await cookies();
        const authenticatedUserId = cookieStore.get("arenax_player_id")?.value;

        if (!authenticatedUserId) {
            console.log("[WEB-PLAYER] No authenticated userId found in cookies, redirecting to auth");
            redirect(`${process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'}`);
        }

        if (authenticatedUserId !== userId) {
            console.log("[WEB-PLAYER] Cookie mismatch, redirecting to own dashboard:", authenticatedUserId);
            redirect(`/${authenticatedUserId}`);
        }

        // Redirection guard
        if (profile.role !== 'player') {
            const roleRedirects: Record<string, string> = {
                'venue-owner': process.env.NEXT_PUBLIC_VENUE_URL || 'http://localhost:3002',
                'admin': process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003'
            };
            const dashboardUrl = roleRedirects[profile.role] || (process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000');
            redirect(`${dashboardUrl}/${authenticatedUserId}`);
        }

        const userName = `${profile.first_name} ${profile.last_name}`;
        const userRole = profile.skill_level ? `${profile.skill_level} ${profile.role}` : profile.role;

        return (
            <CreateMatchProvider>
                <NotificationHandler userId={userId} />
                <div className="app-layout">
                    <SidebarWrapper
                        userId={userId}
                        userName={userName}
                        userRole={userRole}
                        avatarUrl={getProfileImageUrl(profile.avatar_url, "")}
                    />
                    <div className="main-wrapper">
                        <TopBar
                            userId={userId}
                            userName={userName}
                            userRole={userRole}
                            avatarUrl={getProfileImageUrl(profile.avatar_url, "")}
                            statusBadge="PLAYER: ACTIVE"
                            profileHref={`/${userId}`}
                            settingsHref={`/${userId}/settings`}
                        />
                        <main className="app-content">
                            {children}
                        </main>
                    </div>
                </div>
            </CreateMatchProvider>
        );
    } catch (err) {
        console.error("[WEB-PLAYER] ❌ Error in layout:", err);
        redirect(`${process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'}`);
    }
}
