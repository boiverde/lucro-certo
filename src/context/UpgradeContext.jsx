import React, { createContext, useContext, useState } from 'react';

const UpgradeContext = createContext();

export function UpgradeProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");

    const openUpgrade = (msg = "") => {
        setReason(msg);
        setIsOpen(true);
    };

    const closeUpgrade = () => {
        setIsOpen(false);
        setReason("");
    };

    return (
        <UpgradeContext.Provider value={{ isOpen, reason, openUpgrade, closeUpgrade }}>
            {children}
        </UpgradeContext.Provider>
    );
}

export const useUpgrade = () => useContext(UpgradeContext);
