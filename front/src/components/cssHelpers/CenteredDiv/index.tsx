import { FC } from 'react'

export const CenteredDiv: FC = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
    </div>
)
