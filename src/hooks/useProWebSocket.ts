import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getLocationById } from '@/services/location';
import { getCustomerProfile, normalizeImageUrl } from '@/services/customer';
import { getTaskAttachments } from '@/services/task';
import { LiveJob } from '@/types';
import useCategoryStore from '@/store/categoryStore';
export { LiveJob };

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
// Convert http(s) → ws(s)
const WS_BASE = BASE_URL
    .replace(/\/$/, '')
    .replace(/^https/, 'wss')
    .replace(/^http/, 'ws');

// Only the messages the server currently sends
type WSMessage =
    | {
        type: 'task_created';
        task: {
            id: number;
            subject: string;
            body: string;
            price: number;
            category_id: number;
            location_id: number;
            created_at?: string;
            created_by?: number;
            customer_name?: string;
            attachments?: any[];
        };
    }
    | { type: 'heartbeat'; task?: null };

export type WSStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface UseProWebSocketOptions {
    userId: number | undefined;
    isOnline: boolean;
}

interface UseProWebSocketResult {
    jobs: LiveJob[];
    wsStatus: WSStatus;
    hasNoJobs: boolean;
    refresh: () => void;
}

const MAX_RETRY_DELAY_MS = 30_000;
const INITIAL_RETRY_DELAY_MS = 1_000;



export function useProWebSocket({
    userId,
    isOnline,
}: UseProWebSocketOptions): UseProWebSocketResult {
    const [jobs, setJobs] = useState<LiveJob[]>([]);
    const [wsStatus, setWsStatus] = useState<WSStatus>('disconnected');
    const [hasNoJobs, setHasNoJobs] = useState(false);

    const { ensureCategories, getCategoryById, getStyleById } = useCategoryStore();

    const wsRef = useRef<WebSocket | null>(null);
    const retryDelayRef = useRef(INITIAL_RETRY_DELAY_MS);
    const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);
    const shouldConnectRef = useRef(false);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);

    const clearRetryTimer = () => {
        if (retryTimerRef.current) {
            clearTimeout(retryTimerRef.current);
            retryTimerRef.current = null;
        }
    };

    const closeSocket = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.onclose = null; // prevent reconnect loop
            wsRef.current.onerror = null;
            wsRef.current.onmessage = null;
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    const connect = useCallback(() => {
        if (!isMountedRef.current || !userId || !shouldConnectRef.current) return;
        if (wsRef.current) return; // already connected/connecting

        const url = `${WS_BASE}/ws/tasks/`;
        console.log('[useProWebSocket] Connecting to:', url);
        setWsStatus('connecting');

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            if (!isMountedRef.current) return;
            console.log('[useProWebSocket] Connected');
            setWsStatus('connected');
            retryDelayRef.current = INITIAL_RETRY_DELAY_MS;
            // Ensure categories are loaded so we can map category_id → name/style
            ensureCategories();
        };

        ws.onmessage = (event) => {
            if (!isMountedRef.current) return;
            try {
                const msg: WSMessage = JSON.parse(event.data);
                console.log('[useProWebSocket] Message received:', msg);

                if (msg.type === 'task_created' && msg.task) {
                    const t = msg.task;
                    const cat = getCategoryById(t.category_id);
                    const { icon: catIcon, color: catColor } = getStyleById(t.category_id);

                    const newJob: LiveJob = {
                        id: t.id,
                        title: t.subject || 'New Task',
                        description: t.body || '',
                        category: cat?.name ?? `Category ${t.category_id}`,
                        category_icon: catIcon,
                        category_color: catColor,
                        budget: t.price,
                        location_name: 'Loading location...',
                        customer_id: t.created_by,
                        customer_name: t.customer_name || 'Customer',
                        created_at: t.created_at,
                        attachments: t.attachments || [],
                        is_location_loading: Boolean(t.location_id),
                        is_customer_loading: Boolean(t.created_by),
                    };

                    setJobs((prev) => {
                        if (prev.some((j) => j.id === newJob.id)) return prev;
                        setHasNoJobs(false);
                        return [newJob, ...prev];
                    });

                    // Batch fetch customer profile, location, and attachments concurrently via Promise.allSettled
                    (async () => {
                        const [profileResult, locationResult, attachmentsResult] = await Promise.allSettled([
                            t.created_by ? getCustomerProfile(t.created_by) : Promise.resolve(null),
                            t.location_id ? getLocationById(t.location_id) : Promise.resolve(null),
                            t.id ? getTaskAttachments(t.id) : Promise.resolve([]),
                        ]);

                        if (!isMountedRef.current) return;

                        let updatedCustomerProfile: any = null;
                        let updatedCustomerName: string | undefined = undefined;
                        let updatedCustomerImage: string | undefined = undefined;
                        let updatedCustomerRating: number | undefined = undefined;
                        let updatedLocationName: string | undefined = undefined;
                        let updatedAttachments: any[] = t.attachments || [];

                        // Process Customer Profile
                        if (profileResult.status === 'fulfilled' && profileResult.value) {
                            const profile = profileResult.value;
                            const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
                            updatedCustomerName = fullName || t.customer_name || 'Customer';
                            updatedCustomerImage = normalizeImageUrl(profile.image);
                            updatedCustomerRating = profile.overall_rating;
                            updatedCustomerProfile = profile;
                        }

                        // Process Location
                        if (locationResult.status === 'fulfilled' && locationResult.value) {
                            const loc = locationResult.value;
                            updatedLocationName = loc.formatted_address || 'Unknown Location';
                        }

                        // Process Attachments
                        let hasAttachments = false;
                        if (attachmentsResult.status === 'fulfilled' && Array.isArray(attachmentsResult.value) && attachmentsResult.value.length > 0) {
                            updatedAttachments = attachmentsResult.value;
                            hasAttachments = true;
                        }

                        // Batch update state in a single call
                        setJobs((prev) =>
                            prev.map((j) => {
                                if (j.id !== t.id) return j;
                                return {
                                    ...j,
                                    customer_name: updatedCustomerName ?? j.customer_name,
                                    customer_rating: updatedCustomerRating ?? j.customer_rating,
                                    customer_image: updatedCustomerImage ?? j.customer_image,
                                    customer_profile: updatedCustomerProfile ?? j.customer_profile,
                                    is_customer_loading: false,
                                    location_name: updatedLocationName ?? (t.location_id ? 'Location not found' : j.location_name),
                                    is_location_loading: false,
                                    attachments: updatedAttachments,
                                };
                            })
                        );

                        // 3-Second Retry for Attachments if initial fetch yielded no attachments
                        if (!hasAttachments && t.id) {
                            setTimeout(() => {
                                if (!isMountedRef.current) return;
                                console.log(`[useProWebSocket] Retrying attachment fetch for task ${t.id} after 3 seconds...`);
                                getTaskAttachments(t.id)
                                    .then((retryAttachments) => {
                                        if (retryAttachments && Array.isArray(retryAttachments) && retryAttachments.length > 0) {
                                            setJobs((prev) =>
                                                prev.map((j) => (j.id === t.id ? { ...j, attachments: retryAttachments } : j))
                                            );
                                        }
                                    })
                                    .catch((err) => {
                                        console.warn(`[useProWebSocket] 3s attachment retry failed for task ${t.id}:`, err);
                                    });
                            }, 3000);
                        }
                    })();
                }

                const closedTypes = ['task_assigned', 'task_accepted', 'bidding_closed', 'task_closed', 'task_deleted'];
                if (closedTypes.includes(msg.type)) {
                    const closedTaskId = (msg as any).task_id || msg.task?.id || (msg as any).id;
                    if (closedTaskId) {
                        console.log(`[useProWebSocket] Removing closed/assigned task ${closedTaskId} from live jobs feed.`);
                        setJobs((prev) => prev.filter((j) => Number(j.id) !== Number(closedTaskId)));
                    }
                }
                // 'ping' → no-op (heartbeat keepalive)
            } catch (e) {
                console.warn('[useProWebSocket] Failed to parse message:', e);
            }
        };

        ws.onerror = (error) => {
            console.error('[useProWebSocket] WebSocket error:', error);
        };

        ws.onclose = (event) => {
            if (!isMountedRef.current) return;
            wsRef.current = null;
            console.log('[useProWebSocket] Connection closed. Code:', event.code);

            if (!shouldConnectRef.current) {
                setWsStatus('disconnected');
                return;
            }

            // Exponential backoff reconnect
            setWsStatus('reconnecting');
            const delay = retryDelayRef.current;
            retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_DELAY_MS);
            console.log(`[useProWebSocket] Reconnecting in ${delay}ms...`);
            retryTimerRef.current = setTimeout(() => {
                connect();
            }, delay);
        };
    }, [userId]);

    // Connect / disconnect when isOnline or userId changes
    useEffect(() => {
        shouldConnectRef.current = isOnline && !!userId;

        if (isOnline && userId) {
            connect();
        } else {
            clearRetryTimer();
            closeSocket();
            setWsStatus('disconnected');
            setJobs([]);
            setHasNoJobs(false);
        }
    }, [isOnline, userId, connect, closeSocket]);

    // Handle app foreground / background transitions
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
            const prev = appStateRef.current;
            appStateRef.current = nextState;

            if (prev.match(/inactive|background/) && nextState === 'active') {
                // App came to foreground — reconnect if needed
                if (shouldConnectRef.current && !wsRef.current) {
                    clearRetryTimer();
                    retryDelayRef.current = INITIAL_RETRY_DELAY_MS;
                    connect();
                }
            } else if (nextState.match(/inactive|background/)) {
                // App went to background — disconnect to save battery
                clearRetryTimer();
                closeSocket();
            }
        });

        return () => subscription.remove();
    }, [connect, closeSocket]);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            shouldConnectRef.current = false;
            clearRetryTimer();
            closeSocket();
        };
    }, [closeSocket]);

    const refresh = useCallback(() => {
        if (!shouldConnectRef.current) return;
        clearRetryTimer();
        closeSocket();
        retryDelayRef.current = INITIAL_RETRY_DELAY_MS;
        setTimeout(() => connect(), 300);
    }, [connect, closeSocket]);

    return { jobs, wsStatus, hasNoJobs, refresh };
}
