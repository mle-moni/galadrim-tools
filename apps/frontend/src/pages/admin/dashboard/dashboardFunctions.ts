import { DashboardElementProps } from './Dashboard'

export const getColorFromPercent = (percent: number): DashboardElementProps['options']['color'] => {
    if (percent > 80) {
        return 'error'
    }
    if (percent > 60) {
        return 'warning'
    }
    if (percent > 30) {
        return 'info'
    }
    return 'success'
}

export const getGBFromBytes = (bytes: number) => {
    const BYTES_TO_GB_RATIO = 1_000_000_000
    const value = Math.round((bytes / BYTES_TO_GB_RATIO) * 10) / 10

    return value
}

export const getLoadInfos = (load: number, minutes: number): DashboardElementProps['options'] => {
    const value = load
    const maxValue = 100
    const color = getColorFromPercent(value)

    return {
        value,
        maxValue,
        color,
        label: `Load ${minutes} min`,
        unit: '%',
    }
}

const getColorFromUptime = (uptimeHours: number): DashboardElementProps['options']['color'] => {
    const DAYS_7 = 24 * 7
    const DAYS_40 = 24 * 40

    if (uptimeHours > DAYS_40) {
        return 'warning'
    }

    if (uptimeHours > DAYS_7) {
        return 'info'
    }

    return 'success'
}

export const getUptimeInfos = (uptime: number): DashboardElementProps['options'] => {
    const SEC_TO_MIN_RATIO = 60
    const MIN_TO_HOUR_RATIO = 60
    const value = Math.round(uptime / SEC_TO_MIN_RATIO)

    if (value > 1000) {
        const hourValue = Math.round(value / MIN_TO_HOUR_RATIO)

        return {
            label: 'OS Uptime',
            color: getColorFromUptime(hourValue),
            value: hourValue,
            maxValue: hourValue,
            unit: 'h',
        }
    }

    return {
        label: 'OS Uptime',
        color: 'success',
        value,
        maxValue: value,
        unit: 'min',
    }
}

export const getMemoryUsedInfos = (
    memoryUsed: number,
    totalMemory: number
): DashboardElementProps['options'] => {
    const value = getGBFromBytes(memoryUsed)
    const maxValue = getGBFromBytes(totalMemory)
    const percent = (value / maxValue) * 100
    const color = getColorFromPercent(percent)

    return {
        value,
        maxValue,
        color,
        label: 'Memory used',
        unit: 'go',
    }
}

export const getAllMemoryInfos = (totalMemory: number): DashboardElementProps['options'] => {
    const maxValue = getGBFromBytes(totalMemory)

    return {
        value: maxValue,
        maxValue,
        color: 'info',
        label: 'Total memory',
        unit: 'go',
    }
}
