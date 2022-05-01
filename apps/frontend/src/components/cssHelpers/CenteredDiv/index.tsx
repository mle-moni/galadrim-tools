import { CSSProperties, FC, PropsWithChildren } from 'react'

export const CenteredDiv: FC<PropsWithChildren<{ style?: CSSProperties }>> = ({ children, style }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
        {children}
    </div>
)
