import { useState } from 'react'
import './openingBox.css' // Import the CSS file
import ConfettiExplosion from 'react-confetti-explosion'
import { RewindStore } from '../../../../globalStores/RewindStore'
import { Tooltip, Typography } from '@mui/material'

type GiftProps = {
    rewindStore: RewindStore
}

const Gift = ({ rewindStore }: GiftProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleClick = () => {
        if (!isOpen) setIsOpen(!isOpen)
    }

    return (
        <>
            <div className="wrapper" onClick={handleClick}>
                <div
                    className={`gift ${isOpen ? 'open' : ''}`}
                    style={{
                        backgroundImage: 'url(/assets/images/rewind/animal_question_mark.jpg)',
                    }}
                ></div>
                {isOpen && (
                    <div className="content visible">
                        {' '}
                        <div
                            style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 10000 }}
                        >
                            <ConfettiExplosion
                                particleCount={200}
                                duration={2500}
                                force={0.8}
                                zIndex={10001}
                            />
                        </div>
                        <Tooltip
                            title={<Typography>{rewindStore.rewindPersonalityString}</Typography>}
                            placement="top"
                        >
                            <img
                                src={`/assets/images/rewind/${rewindStore.rewindImageName}`}
                                width={600}
                                height={600}
                            />
                        </Tooltip>
                    </div>
                )}
            </div>
        </>
    )
}

export default Gift
