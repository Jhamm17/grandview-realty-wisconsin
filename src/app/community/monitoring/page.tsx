'use client';

import { useState, useEffect } from 'react';
import { mredMonitoring } from '@/lib/mred/monitoring';

interface MonitoringStats {
    hourly: {
        requestCount: number;
        errorCount: number;
        totalDataTransferred: number;
        averageResponseTime: number;
    };
    sync: {
        lastFullSync: Date | null;
        lastIncrementalSync: Date | null;
        successfulSyncs: number;
        failedSyncs: number;
    };
    uptime: number;
}

export default function MonitoringPage() {
    const [stats, setStats] = useState<MonitoringStats | null>(null);

    useEffect(() => {
        // Update stats every 30 seconds
        const updateStats = () => {
            const metrics = mredMonitoring.getMetrics();
            setStats(metrics);
        };

        updateStats();
        const interval = setInterval(updateStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!stats) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">System Monitoring</h1>
            
            {/* API Usage */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">API Requests</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.hourly.requestCount}</p>
                    <p className="text-sm text-gray-500">Last hour</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Requests/Hour</h3>
                    <p className={`text-3xl font-bold ${stats.hourly.requestCount > 1440 ? 'text-red-600' : stats.hourly.requestCount > 1080 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {stats.hourly.requestCount > 0 ? (stats.hourly.requestCount / (stats.uptime / (60 * 60 * 1000))).toFixed(1) : '0'}
                    </p>
                    <p className="text-sm text-gray-500">Current rate (limit: 1800/hour)</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Error Rate</h3>
                    <p className="text-3xl font-bold text-red-600">
                        {stats.hourly.requestCount > 0 ? ((stats.hourly.errorCount / stats.hourly.requestCount) * 100).toFixed(1) : '0'}%
                    </p>
                    <p className="text-sm text-gray-500">{stats.hourly.errorCount} errors this hour</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Data Transfer</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {(stats.hourly.totalDataTransferred / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <p className="text-sm text-gray-500">Last hour</p>
                </div>
            </div>

            {/* Response Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Response Time</h3>
                    <p className="text-3xl font-bold text-purple-600">
                        {stats.hourly.averageResponseTime.toFixed(0)}ms
                    </p>
                    <p className="text-sm text-gray-500">Average</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Rate Limit Status</h3>
                    <p className={`text-3xl font-bold ${stats.hourly.requestCount > 1440 ? 'text-red-600' : stats.hourly.requestCount > 1080 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {stats.hourly.requestCount > 1440 ? 'CRITICAL' : stats.hourly.requestCount > 1080 ? 'WARNING' : 'HEALTHY'}
                    </p>
                    <p className="text-sm text-gray-500">
                        {stats.hourly.requestCount > 0 ? `${((stats.hourly.requestCount / 1800) * 100).toFixed(1)}% of hourly limit` : 'No requests yet'}
                    </p>
                </div>
            </div>

            {/* Cache Status */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4">Cache Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold mb-2">How Caching Works:</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>Property details are cached for 15 minutes</li>
                            <li>Search results are cached for 5 minutes</li>
                            <li>Images are cached for 7 days</li>
                            <li>Old data is automatically removed when space is needed</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Benefits:</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>Faster page loads for users</li>
                            <li>Reduced API usage (saves money)</li>
                            <li>Less strain on MLS servers</li>
                            <li>Better reliability during high traffic</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Last Sync Info */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Synchronization Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2">Last Updates:</h3>
                        <p className="text-gray-600">
                            Full Sync: {stats.sync.lastFullSync ? new Date(stats.sync.lastFullSync).toLocaleString() : 'Never'}
                        </p>
                        <p className="text-gray-600">
                            Incremental Sync: {stats.sync.lastIncrementalSync ? new Date(stats.sync.lastIncrementalSync).toLocaleString() : 'Never'}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Success Rate:</h3>
                        <p className="text-gray-600">
                            Successful Syncs: {stats.sync.successfulSyncs}
                        </p>
                        <p className="text-gray-600">
                            Failed Syncs: {stats.sync.failedSyncs}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 