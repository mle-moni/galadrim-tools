import type { ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";
import { Tooltip } from "@mui/material";
import type { ResourceHeaderProps } from "react-big-calendar";
import { FIELDS_TO_CSS_VARS } from "../../../globalStores/ThemeStore";

interface Props extends ResourceHeaderProps<ApiOfficeRoom> {
    officeFloorsMap: Map<number, ApiOfficeFloor>;
}

export const ResourceHeader = ({ label, resource, officeFloorsMap }: Props) => {
    const cssVarsBg = ["myEventsBg", "otherEventsBg"] as const;
    const cssVarsText = ["myEventsText", "otherEventsText"] as const;
    const floor = officeFloorsMap.get(resource.officeFloorId)?.floor ?? 0;
    const title = `${label} (étage ${floor})`;

    const backgroundColor = FIELDS_TO_CSS_VARS[cssVarsBg[floor % 2]];
    const textColor = FIELDS_TO_CSS_VARS[cssVarsText[floor % 2]];

    return (
        <Tooltip title={title}>
            <div
                style={{
                    backgroundColor: `var(${backgroundColor})`,
                    color: `var(${textColor})`,
                    width: "100%",
                    height: "100%",
                    padding: "10px 4px",
                    borderRadius: 4,
                }}
            >
                {label}
            </div>
        </Tooltip>
    );
};
