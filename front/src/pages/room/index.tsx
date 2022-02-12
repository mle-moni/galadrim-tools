import { Button } from '@mui/material'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Whoami } from '../../components/auth/Whoami'
import { RoomCalendar } from '../../components/Calendar'
import MainLayout from '../../layouts/MainLayout'
import { AppStore } from '../../stores/AppStore'

const RoomPage = () => {
    let params = useParams()
    useEffect(() => {
        AppStore.eventsStore.setRoomName(params.roomName ?? '*')
    }, [])

    return (
        <MainLayout>
            <div>
                <div style={{ position: 'absolute', right: '10px', top: '10px', zIndex: 10 }}>
                    {AppStore.authStore.connected ? <Whoami /> : <></>}
                </div>
                <div style={{ position: 'absolute', left: '10px', top: '10px', zIndex: 10 }}>
                    <Button>
                        <Link to="/">Retour</Link>
                    </Button>
                </div>
                <RoomCalendar />
            </div>
        </MainLayout>
    )
}

export default RoomPage
