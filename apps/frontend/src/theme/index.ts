import { createTheme } from '@mui/material'

declare module '@mui/material/styles' {
    interface BreakpointOverrides {
        xs: false // removes the `xs` breakpoint
        sm: true
        md: false
        lg: false
        xl: false
        desktop: true
    }
}

export const themeColors = {
    primary: {
        main: '#4a453d',
    },
    secondary: {
        main: '#cbd5e1',
        dark: '#94a3b8',
    },
    background: {
        default: '#f9efe6',
    },
    error: {
        main: '#f87171',
    },
} as const

export const getTheme = () =>
    createTheme({
        palette: themeColors,
        breakpoints: {
            values: {
                sm: 600,
                desktop: 769,
            },
        },
    })
