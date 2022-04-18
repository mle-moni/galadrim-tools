
import { Link as MuiLink } from '@mui/material'
import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom'

type CustomLinkProps = PropsWithChildren<{
    to: string;
}>

export const CustomLink = ({ children, ...rest }: CustomLinkProps) => {
    return (
        <MuiLink component={Link} sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
            fontStyle: 'italic',
            transition: 'all 0.3s',
            ':hover': {
                opacity: 0.7
            }
        }} {...rest}>
            {children}
        </MuiLink>
    )
}