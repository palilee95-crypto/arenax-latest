"use client";

import React from "react";
import { Modal } from "@arenax/ui";
import { CreateMatchWizard } from "./CreateMatchWizard";

interface CreateMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({ isOpen, onClose, userId }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Match">
            <div className="create-match-modal-inner">
                <CreateMatchWizard userId={userId} onClose={onClose} />
            </div>
            <style jsx global>{`
                .modal-content {
                    max-width: 800px !important;
                    width: 95% !important;
                    padding: 0 !important;
                    overflow: hidden;
                }
                .create-match-modal-inner {
                    padding: 2rem;
                    max-height: 85vh;
                    overflow-y: auto;
                }
            `}</style>
        </Modal>
    );
};
