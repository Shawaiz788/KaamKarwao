import { useState, useEffect, useCallback } from 'react';

export interface ActiveBidState {
    jobId: number;
    amount: number;
    startTimeMs: number;
    durationMs: number;
}

/**
 * Hook to manage active bids state with timestamp-based synchronization
 * across list cards and detail views. Efficient and zero continuous polling.
 */
export function useActiveBids(durationSeconds: number = 10) {
    const [bids, setBids] = useState<Record<number, ActiveBidState>>({});
    const durationMs = durationSeconds * 1000;



    const placeBid = useCallback(
        (jobId: number, amount: number) => {
            setBids((prev) => ({
                ...prev,
                [jobId]: {
                    jobId,
                    amount,
                    startTimeMs: Date.now(),
                    durationMs,
                },
            }));
        },
        [durationMs]
    );

    const getActiveBid = useCallback(
        (jobId: number | undefined | null): ActiveBidState | null => {
            if (!jobId || !bids[jobId]) return null;
            const b = bids[jobId];
            const elapsed = Date.now() - b.startTimeMs;
            if (elapsed >= b.durationMs) return null;
            return b;
        },
        [bids]
    );

    const activeJobIds = Object.keys(bids).map(Number);

    return {
        placeBid,
        getActiveBid,
        activeJobIds,
    };
}
