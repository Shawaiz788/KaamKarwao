const TIMEOUT_MS = 10000; // 10 seconds timeout

export const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Connection timed out. The server is not responding. Please check your internet connection or try again later.');
        }
        if (error.message && error.message.includes('Network request failed')) {
            throw new Error('Network connection error. Please make sure the server is running and check your internet connection.');
        }
        throw error;
    }
};
