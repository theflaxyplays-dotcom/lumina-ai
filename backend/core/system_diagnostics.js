import os from 'os';

export class SystemDiagnostics {
  getVitals() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    return {
      uptimeSeconds: os.uptime(),
      memoryUsedMB: Math.round(usedMem / (1024 * 1024)),
      memoryTotalMB: Math.round(totalMem / (1024 * 1024)),
      memoryUsagePercent: Math.round((usedMem / totalMem) * 100),
      cpuCores: os.cpus().length,
      platform: os.platform()
    };
  }
}
