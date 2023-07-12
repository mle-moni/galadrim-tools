import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import MainLayout from '../../reusableComponents/layouts/MainLayout'
import { GalabreakStore } from './GalabreakStore'

export const GalabreakPage = observer(() => {
    const store = useMemo(() => new GalabreakStore(), [])

    useEffect(() => {
        store.fetchAll()
    }, [])

    return (
        <MainLayout fullscreen>
            <h2>Je souhaite faire...</h2>
            <div className="toggle-group">
                {/* TODO {store.activities.map} */}
                <label className="inline">
                    <input type="checkbox" />
                </label>
            </div>
        </MainLayout>
    )
})

export default GalabreakPage
