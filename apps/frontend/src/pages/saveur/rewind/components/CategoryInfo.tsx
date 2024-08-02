import { observer } from "mobx-react-lite";
import { getRewindPositionLabel } from "../../../../utils/rewind";

import "./categoryInfo.css";

type CategoryInfoProps = {
    label: string;
    value: number | null;
    average?: number | null;
    position: number | null;
    total: number;
    unit?: string;
    averageUnit?: string;
    conditionalLabel?: string;
};

export const CategoryInfo = observer(
    ({
        label,
        value,
        average,
        position,
        total,
        unit,
        averageUnit,
        conditionalLabel,
    }: CategoryInfoProps) => {
        return (
            <div className="category-info">
                <p className="label">
                    {label}{" "}
                    <strong>
                        {value} {unit}
                    </strong>{" "}
                    !
                </p>
                {average && (
                    <div className="average">
                        Si les calculs sont bons, votre moyenne est de{" "}
                        <strong>
                            {average} {averageUnit ?? unit}
                        </strong>
                    </div>
                )}
                <div className="position">
                    Ce qui vous place en <strong>{getRewindPositionLabel(position, total)}</strong>{" "}
                    parmi les Galagourmets
                </div>
                {conditionalLabel && (
                    <div className="conditional-label">
                        <p>{conditionalLabel}</p>
                    </div>
                )}
            </div>
        );
    },
);
