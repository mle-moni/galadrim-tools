import { useMemo } from 'react'
import { RewindStore } from '../../../../globalStores/RewindStore'
import Gift from '../components/OpeningBox'
import { TextCard } from '../components/TextCard'
import { TimerSlides } from '../../../../reusableComponents/common/TimerSlides'

type SeventhSlideProps = {
    rewindStore: RewindStore
}

export const SeventhSlide = ({ rewindStore }: SeventhSlideProps) => {
    const childrens = useMemo(
        () => [
            {
                component: (
                    <TextCard>
                        <h2>L'heure est venue de découvrir votre animal spirituel :</h2>
                    </TextCard>
                ),
                duration: 4000,
            },
            {
                component: <Gift rewindStore={rewindStore} />,
                duration: Infinity,
            },
        ],
        [rewindStore.loadingState.isLoading]
    )

    return <TimerSlides slides={childrens} isSubSlide />
}
