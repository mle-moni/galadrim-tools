import { RenouvArtWait } from '../../components/RenouvArtWait'

const LoadingPage = () => {
    return (
        <div
            className="flex h-100vh justify-center align-center main-bg"
            style={{ boxSizing: 'border-box' }}
        >
            <RenouvArtWait />
        </div>
    )
}

export default LoadingPage
