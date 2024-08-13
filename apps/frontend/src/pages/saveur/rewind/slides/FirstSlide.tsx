import AnimatedHeading from "../components/AnimatedHeading";

export const FirstSlide = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "16px",
            }}
        >
            <h1>La&nbsp;Resto'spective&nbsp;2023</h1>
            <AnimatedHeading text="Qu'avez-vous&nbsp;mangé&nbsp;?" subtitle />
        </div>
    );
};
