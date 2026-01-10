import { Injectable } from '@nestjs/common';
import * as os from 'os';
import { monitorEventLoopDelay } from 'perf_hooks';

type ProcessInternals = {
    _getActiveHandles?: () => unknown[];
    _getActiveRequests?: () => unknown[];
};

@Injectable()
export class AppService {
    private readonly eventLoopMonitor = monitorEventLoopDelay({ resolution: 10 });

    constructor() {
        this.eventLoopMonitor.enable();
    }

    getHealth(): { status: string; uptime: number } {
        return {
            status: 'ok',
            uptime: process.uptime(),
        };
    }

    getCpuInfo(): {
        cores: number;
        model: string;
        speed: number;
        usage: number;
    }[] {
        return os.cpus().map((cpu) => ({
            cores: 1,
            model: cpu.model,
            speed: cpu.speed,
            usage: 0, // placeholder
        }));
    }

    getMemoryInfo(): {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
        arrayBuffers: number;
        freeMemory: number;
        totalMemory: number;
    } {
        const memUsage = process.memoryUsage();

        return {
            rss: memUsage.rss,
            heapTotal: memUsage.heapTotal,
            heapUsed: memUsage.heapUsed,
            external: memUsage.external,
            arrayBuffers: memUsage.arrayBuffers,
            freeMemory: os.freemem(),
            totalMemory: os.totalmem(),
        };
    }

    getEventLoopInfo(): {
        min: number;
        max: number;
        mean: number;
        stddev: number;
    } {
        const h = this.eventLoopMonitor;

        return {
            min: h.min / 1e6,
            max: h.max / 1e6,
            mean: h.mean / 1e6,
            stddev: h.stddev / 1e6,
        };
    }

    getThreadInfo(): {
        pid: number;
        uptime: number;
        memoryUsage: NodeJS.MemoryUsage;
        activeHandles: number;
        activeRequests: number;
    } {
        let activeHandles = 0;
        let activeRequests = 0;

        try {
            const proc = process as unknown as ProcessInternals;

            if (typeof proc._getActiveHandles === 'function') {
                activeHandles = proc._getActiveHandles().length;
            }

            if (typeof proc._getActiveRequests === 'function') {
                activeRequests = proc._getActiveRequests().length;
            }
        } catch {
            // ignore – private Node APIs may not exist
        }

        return {
            pid: process.pid,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            activeHandles,
            activeRequests,
        };
    }

    getSystemInfo() {
        return {
            health: this.getHealth(),
            cpu: this.getCpuInfo(),
            memory: this.getMemoryInfo(),
            eventLoop: this.getEventLoopInfo(),
            threads: this.getThreadInfo(),
            loadAverage: os.loadavg(),
        };
    }
}
