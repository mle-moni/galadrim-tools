import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { AppStore } from '../globalStores/AppStore'
import LoadingPage from '../pages/loading/LoadingPage'
import { RenouvArtWait } from '../reusableComponents/animations/RenouvArtWait/RenouvArtWait'

const StatisticsPage = React.lazy(() => import('../pages/statistics/StatisticsPage'))
const CreateRestaurantPage = React.lazy(
    () => import('../pages/saveur/createRestaurant/CreateRestaurantPage')
)
const EditRestaurantPage = React.lazy(
    () => import('../pages/saveur/editRestaurant/EditRestaurantPage')
)
const SaveurPage = React.lazy(() => import('../pages/saveur/SaveurPage'))
const HomePage = React.lazy(() => import('../pages/HomePage'))
const LoginPage = React.lazy(() => import('../pages/login/LoginPage'))
const GetOtpPage = React.lazy(() => import('../pages/getOtp/GetOtpPage'))
const ChangePasswordPage = React.lazy(() => import('../pages/changePassword/ChangePasswordPage'))
const CreateUserPage = React.lazy(() => import('../pages/admin/createUser/CreateUserPage'))
const AdminRightsPage = React.lazy(() => import('../pages/admin/rights/AdminRightsPage'))
const DashboardPage = React.lazy(() => import('../pages/admin/dashboard/DashboardPage'))
const AdminPage = React.lazy(() => import('../pages/admin/AdminPage'))
const RoomPage = React.lazy(() => import('../pages/room/RoomPage'))
const NotFoundPage = React.lazy(() => import('../pages/errors/404/NotFoundPage'))

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
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="room" element={<RoomPage />}>
                <Route path=":roomName" element={<RoomPage />} />
            </Route>
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/saveur/restaurants/:id" element={<EditRestaurantPage />} />
            <Route path="/saveur/createRestaurant" element={<CreateRestaurantPage />} />
            <Route path="/saveur" element={<SaveurPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

export default observer(MainRouter)
