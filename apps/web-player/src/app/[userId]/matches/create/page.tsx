"use client";

import React from "react";
import { CreateMatchWizard } from "@/components/CreateMatchWizard";
import { useParams, useRouter } from "next/navigation";

export default function CreateMatchPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;

    const handleClose = () => {
        router.push(`/${userId}/matches`);
    };

    return (
        <div className="create-match-page">
            <CreateMatchWizard userId={userId} onClose={handleClose} />

            <style jsx>{`
                .create-match-page {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    min-height: calc(100vh - 100px);
                }

                @media (max-width: 768px) {
                    .create-match-page {
                        padding: 1rem 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
