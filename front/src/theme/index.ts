import { createTheme } from '@mui/material'

export const themeColors = {
    primary: {
        main: '#4a453d',
    },
    secondary: {
        main: '#94a3b8',
        dark: '#64748b',
    },
    background: {
        default: '#fee9d7',
    },
    error: {
        main: '#ef4444',
    },
} as const

export const getTheme = () =>
    createTheme({
        palette: themeColors,
    })
