import React, { createContext, useContext, useState } from 'react';

const UpgradeContext = createContext();

export function UpgradeProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [pendingPix, setPendingPix] = useState(() => {
        const saved = localStorage.getItem('lc_pending_pix');
        return saved ? JSON.parse(saved) : null;
    });

    const openUpgrade = (msg = "", existingPix = null) => {
        setReason(msg);
        if (existingPix) setPendingPix(existingPix);
        setIsOpen(true);
    };

    const closeUpgrade = () => {
        setIsOpen(false);
        setReason("");
    };

    const savePendingPix = (pix) => {
        setPendingPix(pix);
        if (pix) {
            localStorage.setItem('lc_pending_pix', JSON.stringify(pix));
        } else {
            localStorage.removeItem('lc_pending_pix');
        }
    };

    return (
        <UpgradeContext.Provider value={{ isOpen, reason, pendingPix, openUpgrade, closeUpgrade, savePendingPix }}>
            {children}
        </UpgradeContext.Provider>
    );
}

export const useUpgrade = () => useContext(UpgradeContext);
