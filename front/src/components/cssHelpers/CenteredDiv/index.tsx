import { CSSProperties, FC } from 'react'

export const CenteredDiv: FC<{ style?: CSSProperties }> = ({ children, style }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
        {children}
    </div>
)
