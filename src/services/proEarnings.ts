import { fetchWithAuth } from './fetchClient';
import { ProEarnings } from '@/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const API_URL = BASE_URL ? BASE_URL.replace(/\/$/, '') : '';

export const getProEarnings = async (workerId: number | string): Promise<ProEarnings> => {
    console.log(`[proEarnings API] Fetching earnings for worker ID: ${workerId}`);
    const response = await fetchWithAuth(`${API_URL}/app/professional/earning/${workerId}/`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    const responseText = await response.text();
    console.log('[proEarnings API] Get pro earnings response status:', response.status);
    console.log('[proEarnings API] Get pro earnings response body:', responseText);

    if (!response.ok) {
        throw new Error(`Failed to fetch earnings details. Status: ${response.status}`);
    }

    try {
        return JSON.parse(responseText);
    } catch (e) {
        throw new Error(`Failed to parse professional earnings response. Content: ${responseText}`);
    }
};
