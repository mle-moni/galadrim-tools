import { Fab, type SvgIconTypeMap } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import type { FC } from "react";
import { AppStore } from "../../globalStores/AppStore";
import Sparkles from "../animations/rewind/Sparkles";

export interface LinkInfo {
    Icon: OverridableComponent<SvgIconTypeMap<unknown, "svg">> & {
        muiName: string;
    };
    link: string;
    hidden?: boolean;
    shiny?: boolean;
}

export const POS_OFFSET = 32;
const POS_INCREMENT = 64;

export const RoundedLinks: FC<{
    linkInfos: LinkInfo[];
    horizontalPosition?: "left" | "right";
    verticalPosition?: "top" | "bottom";
}> = ({ linkInfos, horizontalPosition = "left", verticalPosition = "top" }) => {
    const visibleLinks = linkInfos.filter(({ hidden }) => hidden !== true);

    const handleClick = (link: string) => {
        if (link.includes("http")) {
            window.open(link);
            return;
        }
        AppStore.navigate(link);
    };

    return (
        <>
            {visibleLinks.map(({ link, Icon, shiny }, index) => {
                if (shiny) {
                    return (
                        <Fab
                            key={link}
                            size="medium"
                            variant="circular"
                            color="primary"
                            onClick={() => handleClick(link)}
                            sx={{
                                position: "absolute",
                                [verticalPosition]: POS_OFFSET + POS_INCREMENT * index,
                                [horizontalPosition]: POS_OFFSET,
                            }}
                        >
                            <Icon />
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    bottom: 0,
                                    right: 0,
                                    left: 0,
                                }}
                            >
                                <Sparkles />
                            </div>
                        </Fab>
                    );
                }

                return (
                    <Fab
                        key={link}
                        size="medium"
                        variant="circular"
                        color="primary"
                        onClick={() => handleClick(link)}
                        sx={{
                            position: "absolute",
                            [verticalPosition]: POS_OFFSET + POS_INCREMENT * index,
                            [horizontalPosition]: POS_OFFSET,
                        }}
                    >
                        <Icon />
                    </Fab>
                );
            })}
        </>
    );
};
