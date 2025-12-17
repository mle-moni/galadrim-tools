import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Box, CircularProgress, IconButton, type SxProps, Tooltip } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type TimerSlidesProps = {
    slides: { component: React.ReactNode; duration: number }[];
    onEnd?: () => void;
    isSubSlide?: boolean;
};

export const TimerSlides = observer(({ slides, onEnd, isSubSlide }: TimerSlidesProps) => {
    const navigate = useNavigate();

    const [index, setIndex] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [isVisible, setIsVisible] = useState(true); // New state for visibility
    const { duration, component } = slides[index];

    const isLastSlide = index === slides.length - 1;

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setElapsedTime((prev) => {
                    const nextTime = prev + 1000;
                    if (nextTime >= duration) {
                        clearInterval(interval);
                        setIsVisible(false); // Start hiding the slide
                    }
                    return nextTime;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isRunning, index]);

    useEffect(() => {
        if (elapsedTime >= duration) {
            setTimeout(() => {
                // Wait for the fade-out to complete
                goToNextSlide();
                setIsVisible(true); // Show the next slide
            }, 500); // Adjust this timeout to match the transition duration
        }
    }, [elapsedTime, duration]);

    const goToNextSlide = (isClick?: boolean) => {
        if (!isLastSlide) {
            setIndex(index + 1);
        } else {
            if (isClick) navigate("/saveur/rewind/recap");
            onEnd?.();
        }
        setElapsedTime(0);
    };

    const goToPreviousSlide = () => {
        if (index > 0) {
            setIndex(index - 1);
        }
        setElapsedTime(0);
    };

    const togglePlayPause = () => {
        if (isRunning && elapsedTime >= duration) {
            goToNextSlide();
        }
        setIsRunning(!isRunning);
    };

    const progressValue = Math.min((elapsedTime / duration) * 100, 100);

    const slideStyle: SxProps = {
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.5s ease", // Adjust the duration as needed
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        "& > :first-child": {
            backgroundColor: "#F0FFF199",
        },
    };

    const containerStyle: React.CSSProperties = {
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    };
    const childrenContainerStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
    };

    return (
        <div style={isSubSlide ? childrenContainerStyle : containerStyle}>
            <Box sx={slideStyle}>{component}</Box>
            {!isSubSlide && (
                <>
                    <Box position="absolute" display="inline-flex" sx={{ top: 10, right: 10 }}>
                        <CircularProgress
                            variant="determinate"
                            value={100}
                            style={{ color: "rgba(0, 0, 0, 0.1)" }}
                            size={40}
                        />
                        <CircularProgress
                            variant="determinate"
                            value={progressValue}
                            style={{
                                color: "#8367C7",
                                position: "absolute",
                                left: 0,
                                top: 0,
                            }}
                            size={40}
                        />
                        <IconButton
                            onClick={togglePlayPause}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                            size="small"
                        >
                            {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                    </Box>

                    <Tooltip title="Précédent" placement="top">
                        <IconButton
                            onClick={goToPreviousSlide}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: 10,
                            }}
                        >
                            <ChevronLeft />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={isLastSlide ? "Récap" : "Suivant"} placement="top">
                        <IconButton
                            onClick={() => goToNextSlide(true)}
                            style={{
                                position: "absolute",
                                top: "50%",
                                right: 10,
                            }}
                        >
                            <ChevronRight />
                        </IconButton>
                    </Tooltip>
                </>
            )}
        </div>
    );
});
