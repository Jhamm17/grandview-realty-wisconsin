import { WISCONSIN_MLS_CONFIG } from './config';

class WisconsinMLSAuthManager {
    private static instance: WisconsinMLSAuthManager;
    private accessToken: string | null = null;

    private constructor() {}

    public static getInstance(): WisconsinMLSAuthManager {
        if (!WisconsinMLSAuthManager.instance) {
            WisconsinMLSAuthManager.instance = new WisconsinMLSAuthManager();
        }
        return WisconsinMLSAuthManager.instance;
    }

    /**
     * Get authentication headers for MLS Aligned API
     * Required headers:
     * - Authorization: Bearer <token>
     * - Accept: application/json
     * - OUID: <RESO OUID of MLS>
     * - MLS-Aligned_User-Agent: <application name>
     */
    public async getAuthHeaders(): Promise<HeadersInit> {
        if (!WISCONSIN_MLS_CONFIG.ACCESS_TOKEN || WISCONSIN_MLS_CONFIG.ACCESS_TOKEN === 'demo_token') {
            throw new Error('Wisconsin MLS access token not configured');
        }

    // Headers must match MLS Aligned API documentation exactly:
    // MLS-Aligned_User-Agent, Authorization, OUID, Accept
    // Handle token that may or may not already include "Bearer "
    const token = WISCONSIN_MLS_CONFIG.ACCESS_TOKEN.startsWith('Bearer ')
      ? WISCONSIN_MLS_CONFIG.ACCESS_TOKEN
      : `Bearer ${WISCONSIN_MLS_CONFIG.ACCESS_TOKEN}`;
    
    return {
      'MLS-Aligned_User-Agent': WISCONSIN_MLS_CONFIG.APP_NAME,
      'Authorization': token,
      'OUID': WISCONSIN_MLS_CONFIG.OUID,
      'Accept': 'application/json',
    };
    }

    /**
     * Get OUID for the MLS
     */
    public getOUID(): string {
        return WISCONSIN_MLS_CONFIG.OUID;
    }

    /**
     * Get application name
     */
    public getAppName(): string {
        return WISCONSIN_MLS_CONFIG.APP_NAME;
    }
}

export const wisconsinMLSAuth = WisconsinMLSAuthManager.getInstance();

