import { CircularProgress, Tooltip as MuiTooltip } from "@mui/material";
import { ResponsiveContainer, Tooltip, type TooltipProps, Treemap } from "recharts";
import type { RewindStore } from "../../../../globalStores/RewindStore";
import { capitalizeFirstLetter } from "../../../../utils/rewind";

type RewindCategoriesProps = {
    rewindStore: RewindStore;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const CustomizedContent = (props: any) => {
    const { depth, x, y, width, height, color, name, value, root, children } = props;
    const fontSize = 14; // Font size for the text
    const charWidth = fontSize * 0.6; // Approximate width of each character
    const fullText = `${name} : ${value}`;
    const nameOnly = name;
    const fullTextWidth = fullText?.length * charWidth;
    const nameOnlyWidth = nameOnly?.length * charWidth;

    const fitsFullText = width > fullTextWidth && height > fontSize;
    const fitsNameOnly = width > nameOnlyWidth && height > fontSize;

    let displayText = "";
    if (fitsFullText) {
        displayText = capitalizeFirstLetter(fullText);
    } else if (fitsNameOnly) {
        displayText = capitalizeFirstLetter(nameOnly);
    }

    if (depth !== 1 && depth !== 2) {
        return null;
    }

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: root?.color ? root.color : color,
                    stroke: "#F0FFF1",
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                    zIndex: 1000 - depth,
                }}
                rx={10}
                ry={10}
            />
            {displayText && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 7}
                    textAnchor="middle"
                    fill="#000"
                    fontSize={fontSize}
                    fontFamily="Roboto, sans-serif"
                    fontWeight={500}
                    style={{ textDecoration: "capitalize" }}
                >
                    {displayText}
                </text>
            )}
        </g>
    );
};

const CustomTooltip = ({ active, payload }: TooltipProps<string, string>) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="custom-tooltip">
                <p className="tooltip-name">{data.name}</p>
                <p className="tooltip-count">{data.count}</p>
            </div>
        );
    }

    return null;
};

export const RewindCategories = ({ rewindStore }: RewindCategoriesProps) => {
    if (!rewindStore.rewindCategoriesFormattedData) {
        return (
            <MuiTooltip title="Si tu avais rempli, ce serait joli">
                <CircularProgress style={{ color: "#8367C7" }} size={300} />
            </MuiTooltip>
        );
    }

    return (
        <ResponsiveContainer width="90%" height="90%">
            <Treemap
                width={800}
                height={400}
                data={rewindStore.rewindCategoriesFormattedData}
                dataKey="count"
                content={<CustomizedContent />}
            >
                <Tooltip content={<CustomTooltip />} />
            </Treemap>
        </ResponsiveContainer>
    );
};
