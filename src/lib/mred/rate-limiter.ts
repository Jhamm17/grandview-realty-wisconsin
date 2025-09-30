import { mredMonitoring } from './monitoring';
import { MRED_CONFIG } from './config';

class RateLimiter {
    private static instance: RateLimiter;
    private requestQueue: Array<() => Promise<unknown>> = [];
    private isProcessing = false;
    private lastRequestTime = 0;

    private constructor() {}

    public static getInstance(): RateLimiter {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter();
        }
        return RateLimiter.instance;
    }

    public async executeWithRateLimit<T>(requestFn: () => Promise<T>): Promise<T> {
        // Check if we can make a request
        if (!mredMonitoring.canMakeRequest()) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }

        // Ensure minimum delay between requests (1 second for 1 RPS)
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minDelay = 1000 / MRED_CONFIG.MAX_REQUESTS_PER_SECOND; // Convert RPS to milliseconds

        if (timeSinceLastRequest < minDelay) {
            const delay = minDelay - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Track the request start
        const startTime = Date.now();
        this.lastRequestTime = Date.now();

        try {
            const result = await requestFn();
            
            // Track successful request (estimate data size as 1KB for now)
            mredMonitoring.trackRequest(startTime, 1024, false);
            
            return result;
        } catch (error) {
            // Track failed request
            mredMonitoring.trackRequest(startTime, 0, true);
            throw error;
        }
    }

    public async executeWithRetry<T>(
        requestFn: () => Promise<T>, 
        maxRetries: number = 3,
        baseDelay: number = 1000
    ): Promise<T> {
        let lastError: Error;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await this.executeWithRateLimit(requestFn);
            } catch (error) {
                lastError = error as Error;
                
                // If it's a rate limit error, wait longer
                if (error instanceof Error && error.message.includes('Rate limit')) {
                    const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
                    console.warn(`Rate limit hit, waiting ${delay}ms before retry ${attempt + 1}/${maxRetries + 1}`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else if (attempt < maxRetries) {
                    // For other errors, wait a bit before retrying
                    const delay = baseDelay * (attempt + 1);
                    console.warn(`Request failed, retrying in ${delay}ms (${attempt + 1}/${maxRetries + 1})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError!;
    }
}

export const rateLimiter = RateLimiter.getInstance(); 