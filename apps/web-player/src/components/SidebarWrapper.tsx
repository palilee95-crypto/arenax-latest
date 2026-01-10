"use client";

import React, { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, BottomBar } from "@arenax/ui";
import { CreateMatchModal } from "./CreateMatchModal";
import { supabase } from "@arenax/database";

interface SidebarWrapperProps {
    userId: string;
    userName?: string;
    userRole?: string;
    avatarUrl?: string;
}



const sidebarSections = [
    {
        title: "OVERVIEW",
        items: [
            {
                label: "Dashboard",
                href: "/",
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                )
            },
            {
                label: "Reliability Score",
                href: "/reliability",
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                )
            },
            {
                label: "Friends",
                href: "/friends",
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                )
            },
        ]
    },
    {
        title: "MATCHES",
        items: [
            {
                label: "Matches",
                href: "/matches",
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                )
            },
            {
                label: "Create Match",
                href: "#",
                id: "create-match-btn",
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                )
            },
            {
                label: "Find Match",
                href: "/find-match",
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                )
            },
            {
                label: "Find Squad",
                href: "/find-squad",
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                )
            },
        ]
    },
    {
        title: "OTHERS",
        items: [
            {
                label: "Find Venue",
                href: "/venues",
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                )
            },
            {
                label: "My Wallet",
                href: "/wallet",
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                )
            },

            {
                label: "My Team",
                href: "/myteam",
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                )
            },
            {
                label: "Settings",
                href: "/settings",
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                )
            },
        ]
    }
];

export const SidebarWrapper = ({ userId, userName, userRole, avatarUrl }: SidebarWrapperProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const allSections = sidebarSections;

    const updatedSections = useMemo(() => {
        return allSections.map(section => ({
            ...section,
            items: section.items.map((item: any) => {
                if (item.label === "Create Match") {
                    const createMatchHref = `/${userId}/matches/create`;
                    return {
                        ...item,
                        href: createMatchHref,
                        active: pathname === createMatchHref,
                        onClick: () => router.push(createMatchHref)
                    };
                }

                const href = item.href === "/" ? `/${userId}` : `/${userId}${item.href}`;
                return {
                    ...item,
                    href: href,
                    active: pathname === href,
                    onClick: () => router.push(href)
                };
            })
        }));
    }, [allSections, userId, pathname, router]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        // Initial state based on screen size
        if (window.innerWidth > 1024) {
            setIsSidebarOpen(true);
            document.body.classList.remove('sidebar-closed');
        } else {
            setIsSidebarOpen(false);
            document.body.classList.add('sidebar-closed');
        }
    }, []);

    useEffect(() => {
        // Auto-close on navigation for mobile
        if (window.innerWidth <= 1024) {
            setIsSidebarOpen(false);
            document.body.classList.add('sidebar-closed');
        }
    }, [pathname]);

    useEffect(() => {
        const handleToggleSidebar = () => {
            setIsSidebarOpen(prev => {
                const newState = !prev;
                if (newState) {
                    document.body.classList.remove('sidebar-closed');
                } else {
                    document.body.classList.add('sidebar-closed');
                }
                return newState;
            });
        };
        window.addEventListener('open-sidebar', handleToggleSidebar);
        return () => window.removeEventListener('open-sidebar', handleToggleSidebar);
    }, []);

    const bottomBarItems = useMemo(() => [
        {
            label: "Home",
            href: `/${userId}`,
            active: pathname === `/${userId}`,
            onClick: () => router.push(`/${userId}`),
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            )
        },
        {
            label: "Find",
            href: `/${userId}/find-match`,
            active: pathname === `/${userId}/find-match`,
            onClick: () => router.push(`/${userId}/find-match`),
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            )
        },
        {
            label: "Create",
            href: `/${userId}/matches/create`,
            active: pathname === `/${userId}/matches/create`,
            onClick: () => router.push(`/${userId}/matches/create`),
            isCenter: true,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            )
        },
        {
            label: "Matches",
            href: `/${userId}/matches`,
            active: pathname === `/${userId}/matches`,
            onClick: () => router.push(`/${userId}/matches`),
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            )
        },
        {
            label: "Wallet",
            href: `/${userId}/wallet`,
            active: pathname === `/${userId}/wallet`,
            onClick: () => router.push(`/${userId}/wallet`),
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
            )
        }
    ], [userId, pathname, router]);

    return (
        <>
            <Sidebar
                sections={updatedSections}
                userName={userName}
                userRole={userRole}
                avatarUrl={avatarUrl}
                isOpen={isSidebarOpen}
                onClose={() => {
                    if (window.innerWidth <= 1024) {
                        setIsSidebarOpen(false);
                        document.body.classList.add('sidebar-closed');
                    }
                }}
            />
            <BottomBar items={bottomBarItems} />
        </>
    );
};
