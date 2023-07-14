import { AllRights, hasRights } from '@galadrim-tools/shared'
import { SvgIconTypeMap, styled } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { AppStore } from '../../globalStores/AppStore'
import { CustomLink } from '../../reusableComponents/Core/CustomLink'
import { GaladrimRoomsCard } from '../../reusableComponents/Core/GaladrimRoomsCard'
import MainLayout from '../../reusableComponents/layouts/MainLayout'

export interface LinkFormat {
    to: string
    text: string
    icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>>
    right: AllRights
}

const StyledDiv = styled('div')({
    display: 'flex',
    justifyContent: 'center',
})

export const AdminPageTemplate = observer<{ allLinks: LinkFormat[] }>(({ allLinks }) => {
    const user = AppStore.authStore.user
    const links = useMemo(
        () => allLinks.filter(({ right }) => hasRights(user.rights, [right])),
        [user.rights]
    )

    if (user.rights === 0) {
        return <Navigate to={'/'} />
    }

    return (
        <MainLayout fullscreen>
            <StyledDiv>
                <GaladrimRoomsCard size="large" sx={{ width: '100%', maxWidth: 600 }}>
                    <h1 style={{ textAlign: 'center' }}>Administration</h1>
                    {links.map((link) => (
                        <CustomLink key={link.to} to={link.to} p={1}>
                            <link.icon sx={{ mr: 1 }} />
                            {link.text}
                        </CustomLink>
                    ))}
                </GaladrimRoomsCard>
            </StyledDiv>
        </MainLayout>
    )
})
