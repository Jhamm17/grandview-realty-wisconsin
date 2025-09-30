import { MRED_CONFIG } from './config';

interface APIMetrics {
    requestCount: number;
    errorCount: number;
    totalDataTransferred: number;
    averageResponseTime: number;
}

interface SyncMetrics {
    lastFullSync: Date | null;
    lastIncrementalSync: Date | null;
    successfulSyncs: number;
    failedSyncs: number;
}

class MREDMonitoring {
    private static instance: MREDMonitoring;
    private hourlyMetrics: APIMetrics = {
        requestCount: 0,
        errorCount: 0,
        totalDataTransferred: 0,
        averageResponseTime: 0
    };
    private syncMetrics: SyncMetrics = {
        lastFullSync: null,
        lastIncrementalSync: null,
        successfulSyncs: 0,
        failedSyncs: 0
    };
    private metricsStartTime: Date = new Date();

    private constructor() {
        this.resetMetrics();
    }

    public static getInstance(): MREDMonitoring {
        if (!MREDMonitoring.instance) {
            MREDMonitoring.instance = new MREDMonitoring();
        }
        return MREDMonitoring.instance;
    }

    private resetMetrics() {
        this.hourlyMetrics = {
            requestCount: 0,
            errorCount: 0,
            totalDataTransferred: 0,
            averageResponseTime: 0
        };
        this.syncMetrics = {
            lastFullSync: null,
            lastIncrementalSync: null,
            successfulSyncs: 0,
            failedSyncs: 0
        };
        this.metricsStartTime = new Date();
    }

    public trackRequest(startTime: number, dataSize: number, isError: boolean = false) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        this.hourlyMetrics.requestCount++;
        this.hourlyMetrics.totalDataTransferred += dataSize;
        
        if (isError) {
            this.hourlyMetrics.errorCount++;
        }

        // Update average response time
        this.hourlyMetrics.averageResponseTime = (
            (this.hourlyMetrics.averageResponseTime * (this.hourlyMetrics.requestCount - 1) + responseTime) /
            this.hourlyMetrics.requestCount
        );

        // Check rate limits
        this.checkRateLimits();
    }

    public trackSync(type: 'full' | 'incremental', success: boolean) {
        if (success) {
            this.syncMetrics.successfulSyncs++;
            if (type === 'full') {
                this.syncMetrics.lastFullSync = new Date();
            } else {
                this.syncMetrics.lastIncrementalSync = new Date();
            }
        } else {
            this.syncMetrics.failedSyncs++;
        }

        // Log sync status
        this.logSyncStatus(type, success);
    }

    private checkRateLimits() {
        const hoursSinceStart = Math.max((Date.now() - this.metricsStartTime.getTime()) / (60 * 60 * 1000), 0.001); // Avoid division by zero
        const requestsPerHour = this.hourlyMetrics.requestCount / hoursSinceStart;
        const dataPerHour = this.hourlyMetrics.totalDataTransferred / hoursSinceStart / (1024 * 1024 * 1024); // Convert to GB

        if (requestsPerHour > MRED_CONFIG.MAX_REQUESTS_PER_HOUR) {
            this.logWarning(`Exceeding hourly request limit: ${requestsPerHour.toFixed(1)}/hour (limit: ${MRED_CONFIG.MAX_REQUESTS_PER_HOUR})`);
        }

        if (dataPerHour > MRED_CONFIG.MAX_DATA_PER_HOUR_GB) {
            this.logWarning(`Exceeding hourly data transfer limit: ${dataPerHour.toFixed(2)}GB/hour (limit: ${MRED_CONFIG.MAX_DATA_PER_HOUR_GB}GB)`);
        }
    }

    public canMakeRequest(): boolean {
        const hoursSinceStart = Math.max((Date.now() - this.metricsStartTime.getTime()) / (60 * 60 * 1000), 0.001);
        const requestsPerHour = this.hourlyMetrics.requestCount / hoursSinceStart;
        
        // Check if we're approaching the limit (80% threshold)
        const hourlyThreshold = MRED_CONFIG.MAX_REQUESTS_PER_HOUR * 0.8;
        
        if (requestsPerHour >= hourlyThreshold) {
            this.logWarning(`Rate limit threshold reached: ${requestsPerHour.toFixed(1)}/hour (threshold: ${hourlyThreshold})`);
            return false;
        }
        
        return true;
    }

    private logWarning(message: string) {
        console.warn(`[MRED Monitoring] ${message}`);
        // TODO: Implement proper logging/alerting system
    }

    private logSyncStatus(type: 'full' | 'incremental', success: boolean) {
        const status = success ? 'successful' : 'failed';
        console.log(`[MRED Sync] ${type} sync ${status}`);
        // TODO: Implement proper logging system
    }

    public getMetrics() {
        return {
            hourly: this.hourlyMetrics,
            sync: this.syncMetrics,
            uptime: Date.now() - this.metricsStartTime.getTime()
        };
    }

    // Reset metrics every hour
    public startHourlyReset() {
        setInterval(() => {
            this.resetMetrics();
        }, 60 * 60 * 1000); // 1 hour
    }
}

export const mredMonitoring = MREDMonitoring.getInstance(); 