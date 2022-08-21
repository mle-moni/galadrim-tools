import { DashboardInfos } from '@galadrim-tools/shared'
import os from 'os'

export const getDashboardInfos = (): DashboardInfos => {
    const sysUptime = os.uptime()
    const [loadAverage1, loadAverage5, loadAverage15] = os.loadavg()

    const freeMemory = os.freemem()
    const totalMemory = os.totalmem()
    const memoryUsed = totalMemory - freeMemory

    return {
        memoryUsed,
        totalMemory,
        sysUptime,
        loadAverage1,
        loadAverage5,
        loadAverage15,
    }
}
