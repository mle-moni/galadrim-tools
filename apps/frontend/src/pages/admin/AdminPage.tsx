import {
    ChevronLeft,
    Dashboard,
    NotificationAdd,
    PersonAddAlt,
    Settings,
    SportsEsports,
} from '@mui/icons-material'
import { AdminPageTemplate, LinkFormat } from './AdminPageTemplate'

const allLinks: LinkFormat[] = [
    {
        to: '/admin/createUser',
        text: 'Créer un utilisateur',
        icon: PersonAddAlt,
        right: 'USER_ADMIN',
    },
    {
        to: '/admin/rights',
        text: 'Gerer les droits des utilisateurs',
        icon: Settings,
        right: 'RIGHTS_ADMIN',
    },
    {
        to: '/admin/dashboard',
        text: 'Accéder au dashboard',
        icon: Dashboard,
        right: 'DASHBOARD_ADMIN',
    },
    {
        to: '/admin/notifications',
        text: 'Envoyer des notifications',
        icon: NotificationAdd,
        right: 'NOTIFICATION_ADMIN',
    },
    {
        to: '/admin/galaguerre',
        text: 'Galaguerre',
        icon: SportsEsports,
        right: 'GALAGUERRE_ADMIN',
    },
    { to: '/', text: `Retour à l'accueil`, icon: ChevronLeft, right: 'DEFAULT' },
]

export const AdminPage = () => <AdminPageTemplate allLinks={allLinks} />

export default AdminPage
