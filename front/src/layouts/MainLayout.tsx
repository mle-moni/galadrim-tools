import { observer } from 'mobx-react'
import { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Whoami } from '../components/auth/Whoami'
import { AppStore } from '../stores/AppStore'

const MainLayout: FC = ({ children }) => {
    const navigate = useNavigate()
    const { authStore } = AppStore

    useEffect(() => {
        AppStore.setNavigation(navigate)
    }, [])

    useEffect(() => {
        if (!authStore.connected) navigate('/login')
    }, [authStore.connected])

    return (
        <div
            className="flex h-100 flex-column justify-center align-center"
            style={{ boxSizing: 'border-box', padding: '0px 50px 10px' }}
        >
            <div style={{ width: '100%' }}>
                <div style={{ position: 'absolute', right: '10px', top: '10px', zIndex: 10 }}>
                    {authStore.connected ? <Whoami /> : <></>}
                </div>
                {children}
            </div>
        </div>
    )
}

export default observer(MainLayout)
