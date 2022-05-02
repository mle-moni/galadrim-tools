import {
    Card as MuiCard,
    CardProps as MuiCardProps,
    styled,
    experimental_sx as sx,
} from '@mui/material'

interface CardProps extends MuiCardProps {
    size?: 'large' | 'normal'
}

const Root = styled(MuiCard)<CardProps>(({ size, theme }) =>
    sx({
        p: size === 'normal' ? 4 : 8,
        borderRadius: 1.5,
        boxShadow: `0 5px 10px 0 rgba(31, 51, 86, 0.06)`,
        [theme.breakpoints.down('sm')]: {
            borderRadius: 0,
        },
    })
)

export const Card = ({ size = 'normal', ...rest }: CardProps) => {
    return <Root size={size} {...rest} />
}
