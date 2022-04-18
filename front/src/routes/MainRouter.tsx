import { observer } from 'mobx-react'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RenouvArtWait } from '../components/RenouvArtWait'
import LoadingPage from '../pages/loading'
import { AppStore } from '../stores/AppStore'

const StatisticsPage = React.lazy(() => import('../pages/statistics'))
const HomePage = React.lazy(() => import('../pages'))
const LoginPage = React.lazy(() => import('../pages/login'))
const GetOtpPage = React.lazy(() => import('../pages/getOtp'))
const ChangePasswordPage = React.lazy(() => import('../pages/changePassword'))
const RoomPage = React.lazy(() => import('../pages/room'))
const NotFoundPage = React.lazy(() => import('../pages/errors/404'))

const MainRouter = () => {
    return (
        <>
            {AppStore.appIsReady ? (
                <BrowserRouter>
                    <React.Suspense fallback={<LoadingPage />}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/getOtp" element={<GetOtpPage />} />
                            <Route path="/changePassword" element={<ChangePasswordPage />} />
                            <Route path="room" element={<RoomPage />}>
                                <Route path=":roomName" element={<RoomPage />} />
                            </Route>
                            <Route path="/statistics" element={<StatisticsPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </React.Suspense>
                </BrowserRouter>
            ) : (
                <div
                    className="flex h-100vh justify-center align-center main-bg"
                    style={{ boxSizing: 'border-box' }}
                >
                    <RenouvArtWait />
                </div>
            )}
        </>
    )
}

export default observer(MainRouter)
