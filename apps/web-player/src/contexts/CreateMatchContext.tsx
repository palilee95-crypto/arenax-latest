"use client";

import React, { createContext, useContext, useState } from "react";

interface CreateMatchContextType {
    isCreateMatchModalOpen: boolean;
    openCreateMatchModal: () => void;
    closeCreateMatchModal: () => void;
}

const CreateMatchContext = createContext<CreateMatchContextType | undefined>(undefined);

export const CreateMatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false);

    const openCreateMatchModal = () => setIsCreateMatchModalOpen(true);
    const closeCreateMatchModal = () => setIsCreateMatchModalOpen(false);

    return (
        <CreateMatchContext.Provider value={{ isCreateMatchModalOpen, openCreateMatchModal, closeCreateMatchModal }}>
            {children}
        </CreateMatchContext.Provider>
    );
};

export const useCreateMatch = () => {
    const context = useContext(CreateMatchContext);
    if (context === undefined) {
        throw new Error("useCreateMatch must be used within a CreateMatchProvider");
    }
    return context;
};
