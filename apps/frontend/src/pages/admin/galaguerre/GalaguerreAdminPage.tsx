import { Add, ChevronLeft } from '@mui/icons-material'
import { AdminPageTemplate, LinkFormat } from '../AdminPageTemplate'

const allLinks: LinkFormat[] = [
    {
        to: '/admin/galaguerre/createCard',
        text: 'Créer une carte Galaguerre',
        icon: Add,
        right: 'GALAGUERRE_ADMIN',
    },
    { to: '/admin', text: `Retour`, icon: ChevronLeft, right: 'DEFAULT' },
]

export const GalaguerreAdminPage = () => <AdminPageTemplate allLinks={allLinks} />

export default GalaguerreAdminPage
