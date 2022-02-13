import { createTheme } from '@mui/material'

export const themeColors = {
    primary: {
        main: '#4a453d',
    },
    secondary: {
        main: '#cbd5e1',
        dark: '#94a3b8',
    },
    background: {
        default: '#fee9d7',
    },
    error: {
        main: '#f87171',
    },
} as const

export const getTheme = () =>
    createTheme({
        palette: themeColors,
    })
