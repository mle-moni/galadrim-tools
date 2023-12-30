import { useMemo } from 'react'
import { RewindStore } from '../../../../globalStores/RewindStore'
import { RewindCategories } from '../components/RewindCategories'
import { TimerSlides } from '../../../../reusableComponents/common/TimerSlides'
import { TextCard } from '../components/TextCard'

type SixthSlideProps = {
    rewindStore: RewindStore
}

export const SixthSlide = ({ rewindStore }: SixthSlideProps) => {
    const childrens = useMemo(
        () => [
            {
                component: (
                    <TextCard>
                        <h2>
                            Et maintenant, regardons les saveurs culinaires qui enflamment vos
                            papilles
                        </h2>
                    </TextCard>
                ),
                duration: 4000,
            },
            {
                component: <RewindCategories rewindStore={rewindStore} />,
                duration: 10000,
            },
        ],
        [rewindStore.loadingState.isLoading]
    )

    return <TimerSlides slides={childrens} isSubSlide />
}
