import { ChevronLeft, PersonAddAlt, Settings } from '@mui/icons-material'
import { styled, SvgIconTypeMap } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { Card } from '../../components/Core/Card'
import { CustomLink } from '../../components/Core/CustomLink'
import MainLayout from '../../components/layouts/MainLayout'
import { useRights } from '../../hooks/useRights'

interface LinkFormat {
    to: string
    text: string
    icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>>
}

const allLinks: LinkFormat[] = [
    {
        to: '/admin/createUser',
        text: 'Créer un utilisateur',
        icon: PersonAddAlt,
    },
    {
        to: '/admin/rights',
        text: 'Gerer les droits des utilisateurs',
        icon: Settings,
    },
    { to: '/', text: `Retour à l'accueil`, icon: ChevronLeft },
]

const StyledDiv = styled('div')({
    display: 'flex',
    justifyContent: 'center',
})

export const AdminPage = () => {
    useRights('some', ['EVENT_ADMIN', 'RIGHTS_ADMIN', 'USER_ADMIN'], '/')

    return (
        <MainLayout fullscreen>
            <StyledDiv>
                <Card size="large" sx={{ width: '100%', maxWidth: 600 }}>
                    <h1 style={{ textAlign: 'center' }}>Administration</h1>
                    {allLinks.map((link) => (
                        <CustomLink key={link.to} to={link.to} p={1}>
                            <link.icon sx={{ mr: 1 }} />
                            {link.text}
                        </CustomLink>
                    ))}
                </Card>
            </StyledDiv>
        </MainLayout>
    )
}

export default AdminPage
