import { SnackbarProvider } from 'notistack'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RenouvArtWait } from './components/RenouvArtWait'

const StatisticsPage = React.lazy(() => import('./pages/statistics'))
const App = React.lazy(() => import('./pages/'))

ReactDOM.render(
    <React.StrictMode>
        <SnackbarProvider>
            <BrowserRouter>
                <React.Suspense fallback={<RenouvArtWait />}>
                    <Routes>
                        <Route path="/" element={<App />} />
                        <Route path="/statistics" element={<StatisticsPage />} />
                        <Route path="*" element={<p>Page not found</p>} />
                    </Routes>
                </React.Suspense>
            </BrowserRouter>
        </SnackbarProvider>
    </React.StrictMode>,
    document.getElementById('root')
)
