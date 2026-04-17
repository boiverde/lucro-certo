import { useState, useEffect, useCallback } from 'react';
import { httpClient } from './httpClient';

const CACHE_KEY = 'lc_plan_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCached() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts < CACHE_TTL) return data;
        return null;
    } catch {
        return null;
    }
}

function setCache(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    } catch { /* ignore */ }
}

export function invalidatePlanCache() {
    localStorage.removeItem(CACHE_KEY);
}

/**
 * Hook que retorna { plan, loading, refresh }
 * plan: 'free' | 'pro' | null
 */
export function usePlan() {
    const [planData, setPlanData] = useState(() => getCached());
    const [loading, setLoading] = useState(!getCached());

    const fetchPlan = useCallback(async (force = false) => {
        const cached = getCached();
        if (cached && !force) {
            setPlanData(cached);
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const data = await httpClient('/payments/plan-status');
            if (data?.plan) {
                setCache(data);
                setPlanData(data);
            }
        } catch {
            // silencia erro — não quebra layout
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlan();
    }, [fetchPlan]);

    return { 
        plan: planData?.plan || 'free', 
        expiresAt: planData?.planExpiresAt || null,
        loading, 
        refresh: () => fetchPlan(true) 
    };
}
