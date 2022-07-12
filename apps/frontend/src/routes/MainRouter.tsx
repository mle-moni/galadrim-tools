import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { fetchBackendJson } from '../api/fetch'
import { RenouvArtWait } from '../components/RenouvArtWait'
import LoadingPage from '../pages/loading'
import { AppStore } from '../stores/AppStore'

const StatisticsPage = React.lazy(() => import('../pages/statistics'))
const SaveurPage = React.lazy(() => import('../pages/saveur'))
const HomePage = React.lazy(() => import('../pages'))
const LoginPage = React.lazy(() => import('../pages/login'))
const GetOtpPage = React.lazy(() => import('../pages/getOtp'))
const ChangePasswordPage = React.lazy(() => import('../pages/changePassword'))
const CreateUserPage = React.lazy(() => import('../pages/admin/createUser'))
const AdminRightsPage = React.lazy(() => import('../pages/admin/rights'))
const AdminPage = React.lazy(() => import('../pages/admin'))
const RoomPage = React.lazy(() => import('../pages/room'))
const NotFoundPage = React.lazy(() => import('../pages/errors/404'))

const MainRouter = () => {
    return (
        <>
            {AppStore.appIsReady ? (
                <BrowserRouter>
                    <React.Suspense fallback={<LoadingPage />}>
                        <AppRoutes />
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

const Test = () => {
    return (
        <>
            <form
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                }}
                onSubmit={(e) => {
                    e.preventDefault()
                    const form = new FormData(e.target as ConstructorParameters<typeof FormData>[0])
                    const tagIds = [1]
                    tagIds.forEach((id) => form.append('tags[]', id.toString()))
                    fetchBackendJson('/restaurants', 'POST', {
                        body: form,
                    })
                }}
            >
                <input type="text" name="name" defaultValue={'testname'} />
                <input type="text" name="description" defaultValue={'description'} />
                <input type="text" name="lat" defaultValue={'1.1'} />
                <input type="text" name="lng" defaultValue={'1.1'} />
                <input type="file" accept="image/png" name="image" />
                <button>send</button>
            </form>
        </>
    )
}

const AppRoutes = () => {
    const navigate = useNavigate()

    useEffect(() => {
        AppStore.setNavigation(navigate)
    }, [])

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/getOtp" element={<GetOtpPage />} />
            <Route path="/changePassword" element={<ChangePasswordPage />} />
            <Route path="/admin/createUser" element={<CreateUserPage />} />
            <Route path="/admin/rights" element={<AdminRightsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="room" element={<RoomPage />}>
                <Route path=":roomName" element={<RoomPage />} />
            </Route>
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/saveur" element={<SaveurPage />} />
            <Route path="/test" element={<Test />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

export default observer(MainRouter)
