import { Box } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { PropsWithChildren } from 'react'

export type MultipleFieldsProps = PropsWithChildren<{
    numberOfFieldsPerLine: number
    my?: number
    mt?: number
    mb?: number
}>

export function MultipleFields({
    numberOfFieldsPerLine,
    children,
    my,
    mt,
    mb,
}: MultipleFieldsProps) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${numberOfFieldsPerLine}, 1fr)`,
                columnGap: 2,
                my,
                mt,
                mb,
            }}
        >
            {children}
        </Box>
    )
}

type DoubleFieldsProps = Omit<MultipleFieldsProps, 'numberOfFieldsPerLine'>

export const DoubleFields = observer<DoubleFieldsProps>((props) => (
    <MultipleFields {...props} numberOfFieldsPerLine={2} />
))
