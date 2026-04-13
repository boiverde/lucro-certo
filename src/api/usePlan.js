import { useState, useEffect, useCallback } from 'react';
import { httpClient } from './httpClient';

const CACHE_KEY = 'lc_plan_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCached() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { plan, ts } = JSON.parse(raw);
        if (Date.now() - ts < CACHE_TTL) return plan;
        return null;
    } catch {
        return null;
    }
}

function setCache(plan) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ plan, ts: Date.now() }));
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
    const [plan, setPlan] = useState(() => getCached());
    const [loading, setLoading] = useState(!getCached());

    const fetchPlan = useCallback(async (force = false) => {
        const cached = getCached();
        if (cached && !force) {
            setPlan(cached);
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
                setCache(data.plan);
                setPlan(data.plan);
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

    return { plan, loading, refresh: () => fetchPlan(true) };
}
