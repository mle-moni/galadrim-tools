const AnimatedHeading = ({ text, subtitle }: { text: string; subtitle?: boolean }) => {
    const letters = text.split("").map((letter, index) => (
        // @ts-ignore
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <span key={index} className="letter" style={{ "--index": index }}>
            {letter}
        </span>
    ));

    if (subtitle) {
        return <h2>{letters}</h2>;
    }

    return <h1>{letters}</h1>;
};

export default AnimatedHeading;
