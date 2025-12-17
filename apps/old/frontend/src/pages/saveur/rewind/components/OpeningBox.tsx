import { Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import type { RewindStore } from "../../../../globalStores/RewindStore";
import "./openingBox.css"; // Import the CSS file

type GiftProps = {
    rewindStore: RewindStore;
};

const Gift = ({ rewindStore }: GiftProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        if (!isOpen) setIsOpen(!isOpen);
    };

    return (
        <>
            <div className="wrapper" onClick={handleClick}>
                <div
                    className={`gift ${isOpen ? "open" : ""}`}
                    style={{
                        backgroundImage: "url(/assets/images/rewind/animal_question_mark.jpg)",
                    }}
                />
                {isOpen && (
                    <div className="content visible">
                        {" "}
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                zIndex: 10000,
                            }}
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
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    width: 600,
                                    height: 600,
                                }}
                            />
                        </Tooltip>
                    </div>
                )}
            </div>
        </>
    );
};

export default Gift;
