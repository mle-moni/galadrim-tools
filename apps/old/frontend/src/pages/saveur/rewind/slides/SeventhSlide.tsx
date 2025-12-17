import { useMemo } from "react";
import type { RewindStore } from "../../../../globalStores/RewindStore";
import { TimerSlides } from "../../../../reusableComponents/common/TimerSlides";
import Gift from "../components/OpeningBox";
import { TextCard } from "../components/TextCard";

type SeventhSlideProps = {
    rewindStore: RewindStore;
};

export const SeventhSlide = ({ rewindStore }: SeventhSlideProps) => {
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
                duration: Number.POSITIVE_INFINITY,
            },
        ],
        [rewindStore.loadingState.isLoading],
    );

    return <TimerSlides slides={childrens} isSubSlide />;
};
