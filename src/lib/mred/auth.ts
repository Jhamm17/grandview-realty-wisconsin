import { MRED_CONFIG } from './config';

class MREDAuthManager {
    private static instance: MREDAuthManager;
    private accessToken: string | null = null;

    private constructor() {}

    public static getInstance(): MREDAuthManager {
        if (!MREDAuthManager.instance) {
            MREDAuthManager.instance = new MREDAuthManager();
        }
        return MREDAuthManager.instance;
    }

    public async getAuthHeaders(): Promise<HeadersInit> {
        if (!MRED_CONFIG.ACCESS_TOKEN) {
            throw new Error('Access token not configured');
        }

        return {
            'Authorization': `Bearer ${MRED_CONFIG.ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        };
    }
}

export const mredAuth = MREDAuthManager.getInstance(); 