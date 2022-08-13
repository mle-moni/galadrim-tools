import { AllRights, hasRights, hasSomeRights } from '@galadrim-rooms/shared'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppStore } from '../globalStores/AppStore'
import { AuthStore } from '../globalStores/AuthStore'
import { notifyError } from '../utils/notification'

export type RightsMode = 'some' | 'all'

const checkAccess = (
    connected: boolean,
    authStore: AuthStore,
    mode: RightsMode,
    rightsWanted: AllRights[]
) => {
    if (!connected) {
        return false
    }
    if (mode === 'all') {
        return hasRights(authStore.user.rights, rightsWanted)
    }
    return hasSomeRights(authStore.user.rights, rightsWanted)
}

export const useRights = (
    mode: RightsMode,
    rightsWanted: AllRights[],
    redirectPath?: string
): boolean => {
    const { authStore } = AppStore
    const message = useRef<string | null>(null)

    const canAccess = checkAccess(authStore.connected, authStore, mode, rightsWanted)
    const navigate = useNavigate()

    useEffect(() => {
        if (!canAccess && message.current === null) {
            message.current = "Vous n'avez pas les droits requis pour voir cette page"
            if (redirectPath !== undefined) {
                notifyError(message.current)
                navigate(redirectPath)
            }
        }
    }, [canAccess])

    if (!canAccess) {
        return false
    }

    return canAccess
}
