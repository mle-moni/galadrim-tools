import { ChevronLeft, PersonAddAlt } from '@mui/icons-material'
import { SvgIconTypeMap } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { Card } from '../../components/Core/Card'
import { CustomLink } from '../../components/Core/CustomLink'
import MainLayout from '../../components/layouts/MainLayout'

interface LinkFormat {
    to: string
    text: string
    icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>
}

const allLinks: LinkFormat[] = [
    { to: '/admin/createUser', text: 'Créer un utilisateur', icon: PersonAddAlt },
    { to: '/', text: `Retour à l'accueil`, icon: ChevronLeft },
]

export const AdminPage = () => (
    <MainLayout fullscreen>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Card size="large" sx={{ width: '100%', maxWidth: 600 }}>
                <h1 style={{ textAlign: 'center' }}>Administration</h1>
                {allLinks.map((link) => (
                    <CustomLink key={link.to} to={link.to} p={1}>
                        <link.icon sx={{ mr: 1 }} />
                        {link.text}
                    </CustomLink>
                ))}
            </Card>
        </div>
    </MainLayout>
)

export default AdminPage
