import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthStore } from '../globalStores/AuthStore'

const whiteListedRoutes = ['/login', '/getOtp']

export const useCheckConnection = (authStore: AuthStore) => {
    const navigate = useNavigate()

    useEffect(() => {
        if (!authStore.connected && !whiteListedRoutes.includes(location.pathname)) {
            navigate('/login')
        }
    }, [authStore.connected])
}
