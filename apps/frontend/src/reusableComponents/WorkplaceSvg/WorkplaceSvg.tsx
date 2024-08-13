import type React from "react";
import { useEffect, useState } from "react";

export type WorkplaceSvgRoom =
    | "Work1"
    | "Work2"
    | "Work3"
    | "Work4"
    | "Toilets"
    | "Kitchen"
    | "Adier"
    | "Corridor"
    | "Vador"
    | "Turing"
    | "Coffre"
    | "Debarras"
    | "PetitCouloir"
    | "Manguier"
    | "Babyfoot"
    | "Cube"
    | "Arche"
    | "Other"
    | "Nantes_Boudoir"
    | "Nantes_Cave"
    | "Nantes_Torture"
    | "Nantes_Placard"
    | "SaintPaul_Amesh"
    | "SaintPaul_Lovelace"
    | "SaintPaul_Turing"
    | "SaintPaul_Manguier"
    | "SaintPaul_Tresor"
    | "SaintPaul_Olympe"
    | "SaintPaul_Foret"
    | "SaintPaul_Mediterranee"
    | "SaintPaul_Vador"
    | "SaintPaul_SuperPhoneBox";

export interface WorkplaceSvgProps {
    width: number;
    height: number;
    wallsColor: string;
    backgroundColor: (room: WorkplaceSvgRoom) => string;
    backgroundColorHover: (room: WorkplaceSvgRoom) => string;
    onClick: (room: WorkplaceSvgRoom) => void;
    onMouseOut: (room: WorkplaceSvgRoom) => void;
    onMouseOver: (room: WorkplaceSvgRoom) => void;
    style: (room: WorkplaceSvgRoom) => React.CSSProperties;
    key: string | undefined;
    getUserPictureUrl: (room: WorkplaceSvgRoom) => string | null;
}

const defaultProps: Required<WorkplaceSvgProps> = {
    width: 991,
    height: 812,
    wallsColor: "#0A192F",
    backgroundColor: () => "#F2F6FB",
    backgroundColorHover: () => "#E2E6EB",
    onClick: () => ({}),
    onMouseOut: () => ({}),
    onMouseOver: () => ({}),
    style: () => ({}),
    key: undefined,
    getUserPictureUrl: () => null,
};

const useRoom = (
    room: Extract<WorkplaceSvgRoom, keyof typeof roomToId>,
    {
        backgroundColor,
        backgroundColorHover,
        onClick,
        onMouseOut,
        onMouseOver,
        style,
    }: Pick<
        WorkplaceSvgProps,
        | "backgroundColor"
        | "backgroundColorHover"
        | "onClick"
        | "onMouseOut"
        | "onMouseOver"
        | "style"
    >,
) => {
    const [color, setColor] = useState(backgroundColor(room));

    return {
        fill: color,
        onMouseOver: () => {
            setColor(backgroundColorHover(room));
            onMouseOver(room);
        },
        onMouseOut: () => {
            setColor(backgroundColor(room));
            onMouseOut(room);
        },
        cursor: "pointer",
        onClick: () => onClick(room),
        style: {
            transition: "all 0.2s",
            ...style(room),
        },
        id: roomToId[room],
    };
};

export const WorkplaceSvg = () => null;

const PORTRAIT_SIZE = 60;

export const roomToId: Record<Extract<WorkplaceSvgRoom, `SaintPaul${string}`>, string> = {
    SaintPaul_Amesh: "amesh",
    SaintPaul_Lovelace: "lovelace",
    SaintPaul_Turing: "turing",
    SaintPaul_Manguier: "manguier",
    SaintPaul_Tresor: "tresor",
    SaintPaul_Olympe: "olympe",
    SaintPaul_Foret: "foret",
    SaintPaul_Mediterranee: "mediterranee",
    SaintPaul_Vador: "vador",
    SaintPaul_SuperPhoneBox: "superPhoneBox",
};

const WorkplaceWorkers = ({ getUserPictureUrl }: Pick<WorkplaceSvgProps, "getUserPictureUrl">) => {
    const [elementByRoomId, setElementByRoomId] = useState<
        Record<string, SVGGraphicsElement | null | undefined>
    >({});

    useEffect(() => {
        const newElementByRoomId = Object.fromEntries(
            Object.entries(roomToId).map(([roomName, roomId]) => {
                return [roomId, document.getElementById(roomId) as SVGGraphicsElement | null];
            }),
        );

        setElementByRoomId(newElementByRoomId);
    }, []);

    return (
        <>
            {Object.entries(roomToId).map(([roomName, roomId]) => {
                const userPicture = getUserPictureUrl(roomName as WorkplaceSvgRoom);

                if (!userPicture) {
                    return null;
                }

                const roomElement = elementByRoomId[roomId];
                if (roomElement === null || roomElement === undefined) {
                    return null;
                }

                const boundingBox = roomElement.getBBox();

                return (
                    <foreignObject
                        key={roomId}
                        x={boundingBox.x + boundingBox.width / 2 - PORTRAIT_SIZE / 2}
                        y={boundingBox.y + boundingBox.height / 2 - PORTRAIT_SIZE / 2}
                        width={`${PORTRAIT_SIZE}px`}
                        height={`${PORTRAIT_SIZE}px`}
                        pointerEvents="none"
                    >
                        <img
                            width={`${PORTRAIT_SIZE}px`}
                            height={`${PORTRAIT_SIZE}px`}
                            src={userPicture}
                            style={{ borderRadius: "50%" }}
                        />
                    </foreignObject>
                );
            })}
        </>
    );
};

export const Floor2 = (props: Partial<WorkplaceSvgProps>) => {
    const { width, height, wallsColor, key, getUserPictureUrl, ...roomsProps } = {
        ...defaultProps,
        ...props,
    };

    const svgPropsLovelace = useRoom("SaintPaul_Lovelace", roomsProps);
    const svgPropsTuring = useRoom("SaintPaul_Turing", roomsProps);

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 773 534"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g id="floor-2-without-background">
                <path
                    id="floor2background"
                    d="M259 517L241 198L445 178L476.5 227.5V504L773 489V0.5L0 73L9 222L25 534L259 522V517Z"
                    fill="#EEEEEE"
                />
                <path
                    id="Vector 32"
                    d="M271.5 515L253 203L443.5 186.5L467.5 226.5V492.5H463V504L271.5 515Z"
                    fill="#DEB887"
                    stroke="#259D59"
                />
                <path
                    {...svgPropsTuring}
                    d="M679.5 304V253.5H747.5V255.5H761V264.5H772.5V299.5H761V332.5H772.5V334.5V369.5H761V415.5H765.5V417.5H772.5V454H761V455V479.5H760.5H760H759.5H709V480V487.5H672.5V483.5L619.5 484.5V304H620.5H679.5Z"
                    stroke="black"
                />
                <path
                    {...svgPropsLovelace}
                    d="M620.5 21.5V239.5H633.5V249H746.5V242H759.5V233.5V232.5L766 232V195.5H761L760.5 163.5V162.5H766L766.5 128.5H760.5V80H766.5V42.5H760.5V5.5L620.5 19V21.5Z"
                    stroke="black"
                />
                <path
                    id="Vector 25"
                    d="M12 96V74.5L108 71.5L169.5 63.5L174 193L47.5 198V200.5H19V196.5L14 195L12 153H16.5L15.5 137H10.5L9 97.5L12 96Z"
                    stroke="black"
                />
                <path
                    id="Vector 26"
                    d="M20.5 232V205.5L111 202.5V197.5H138.5V200H175V204L229.5 202.5V204H237.5V208.5H242L243.5 210L245 254.5H242V284H248.5L249.5 329.5L245 331.5L247 361H252L255 404.5L249.5 407.5V434.5L257.5 438V479.5L255 484V504.5L38 515.5V511.5L28 509.5V489.5H36L31.5 400.5H20.5V372.5H28V349L83.5 346L79.5 284L24 287.5V273.5H15L12 232H20.5Z"
                    stroke="black"
                />
                <path
                    id="Vector 27"
                    d="M28 344.5L25 292L75 289.5L78 342L28 344.5Z"
                    stroke="black"
                />
                <path
                    id="Vector 28"
                    d="M479 301H570H609.5H612V485L565 487V491H529.5V489L479 491V466.5H472.5V431H479V382H475.5V367H479V348.5H472.5V313H479V301Z"
                    stroke="black"
                />
                <path id="Vector 29" d="M558 92.5V24.5L612 20V92.5H558Z" stroke="black" />
                <path id="Vector 30" d="M513 92.5H553.5V38.5H513V92.5Z" stroke="black" />
                <g id="Vector 31">
                    <path d="M453.5 35.5V93.5H509V92.5V30.5L453.5 35.5Z" stroke="black" />
                    <path
                        d="M294.5 53V75H306V96.5L298 97.5L301 186.5H309.5V191.5L345 188V183L370.5 181V186.5L406.5 183V176.5L439.5 174V161H447.5V151H550.5L570 171V294.5H573V300.5H618.5V255.5H609V243.5H611.5V97.5H449V53L440 50.5V38L294.5 53Z"
                        stroke="black"
                    />
                </g>
            </g>
            <WorkplaceWorkers getUserPictureUrl={getUserPictureUrl} />
        </svg>
    );
};

export const Floor3 = (props: Partial<WorkplaceSvgProps>) => {
    const { width, height, wallsColor, key, getUserPictureUrl, ...roomsProps } = {
        ...defaultProps,
        ...props,
    };

    const svgPropsAmesh = useRoom("SaintPaul_Amesh", roomsProps);
    const svgPropsManguier = useRoom("SaintPaul_Manguier", roomsProps);
    const svgPropsForet = useRoom("SaintPaul_Foret", roomsProps);
    const svgPropsVador = useRoom("SaintPaul_Vador", roomsProps);

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 516 513"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g id="floor3-without-background">
                <path
                    id="floor3background"
                    d="M219.5 229.5L193 182L39.5 196L34.5 45.5L512.5 0.5V247.5V486L219.5 501.5V229.5Z"
                    fill="#EEEEEE"
                />
                <path
                    {...svgPropsAmesh}
                    d="M423.5 253.5H503.5V264.5H515.5V299.5H503.5V333H515.5V368.5H503.5V415.5H515.5V452.5H503V476.5L453 478.5V481.5L417 483V480.5L364 483V304H423.5V253.5Z"
                    stroke="#333333"
                />
                <path
                    {...svgPropsManguier}
                    d="M222.5 300V312H216.5V348H222.5V366H219.5V382H222.5V429.5H216.5V464.5H222.5V490L273 488.5V491.5L309 490V485.5L356.5 484V300H222.5Z"
                    stroke="#333333"
                />
                <path
                    {...svgPropsForet}
                    d="M365 19L404.5 15V22L468.5 16.5V8.5L503.5 4.5V41.5H515.5V79H503.5V126.5H515.5V163H503.5V195.5H515.5V231.5H503.5V240H364.5V19H365Z"
                    stroke="#333333"
                />
                <path
                    {...svgPropsVador}
                    d="M39.5 51.5L45 184.5H53.5V189.5L88 187V181L113.5 179L115.5 184.5L151 181V176.5L176 174V170.5H191.5V149H192.5H193.5V35.5L39.5 50.5V51.5Z"
                    stroke="#333333"
                />
                <g id="Vector 33">
                    <path d="M302 91V22.5L356 18.5V91H302Z" stroke="black" />
                    <path d="M256.5 91V27.5L298 22.5V91H256.5Z" stroke="black" />
                    <path d="M252.5 91V28.5L198 33V91H252.5Z" stroke="black" />
                </g>
                <path
                    id="Vector 32"
                    d="M18.5 512.5L0 200.5L190.5 184L214.5 224V490H210V501.5L18.5 512.5Z"
                    fill="#DEB887"
                    fill-opacity="0.5"
                />
                <path
                    id="Vector 41"
                    d="M198 149V97V96.5H357V241H353V242V252.5H365V254V299.5H315V170.5L295 149H198Z"
                    stroke="black"
                />
            </g>
            <defs>
                <clipPath id="clip0_338_502">
                    <rect width="53" height="34" fill="white" transform="translate(251 28)" />
                </clipPath>
            </defs>
            <WorkplaceWorkers getUserPictureUrl={getUserPictureUrl} />
        </svg>
    );
};

export const Floor4 = (props: Partial<WorkplaceSvgProps>) => {
    const { width, height, wallsColor, key, getUserPictureUrl, ...roomsProps } = {
        ...defaultProps,
        ...props,
    };

    const svgPropsTresor = useRoom("SaintPaul_Tresor", roomsProps);
    const svgPropsOlympe = useRoom("SaintPaul_Olympe", roomsProps);
    const svgPropsMediterranee = useRoom("SaintPaul_Mediterranee", roomsProps);
    const svgPropsPhoneBox = useRoom("SaintPaul_SuperPhoneBox", roomsProps);

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 1219 566"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g id="floor4-without-background">
                <path
                    id="floor3-background"
                    d="M19.5 566L1 284.5L292 249.5V236L436 221L428.5 80L1212 1V499.5L916 510.5V228.5L884 180.5L675.5 205.5L694 519L19.5 566Z"
                    fill="#EEEEEE"
                />
                <path
                    {...svgPropsTresor}
                    d="M0.5 285L10 411.5L56.5 406.5L126 330.5L120 305H110.5L105.5 273L0.5 285Z"
                    stroke="black"
                />
                <path
                    {...svgPropsMediterranee}
                    d="M121.5 273H125.5V267L147.5 265L148.5 269L201 262.5V267H207L210 311H207V316.5V318H212.5H215.5V364L144.5 368.5L113.5 402.5L86.5 380L125.5 335.5L121.5 273Z"
                    stroke="black"
                />
                <path
                    {...svgPropsPhoneBox}
                    d="M217 315L217.5 364L272.5 361L270.5 312.5L217 315Z"
                    stroke="black"
                />
                <path
                    {...svgPropsOlympe}
                    d="M117 407L147 374.5L208 371L218.5 546H214V551.5L174 552.5V555.5L126 558.5V555.5L118 440H119.5V427.5L117 426.5V407Z"
                    stroke="black"
                />
                <path id="Vector 35" d="M951 94.5V27L993.5 20V94.5H951Z" stroke="black" />
                <path id="Vector 36" d="M997 94.5V20.5L1053.5 15.5V94.5H997Z" stroke="black" />
                <path
                    id="Vector 37"
                    d="M1062 244.5V19.5L1130 9.5V17.5L1144 15.5L1142.5 7.5L1195.5 1V3H1205.5V42H1217.5C1219.1 42 1218.17 67.3333 1217.5 80H1205.5V130H1217.5V166.5H1205.5V168.5V200H1217.5V237.5H1204V246H1192V254.5H1154.5V246H1144V254.5H1075.5V244.5H1062Z"
                    stroke="black"
                />
                <path
                    id="Vector 38"
                    d="M1122 310.5V259V257.5H1191V260H1192.5H1204V269H1211.5V271H1217.5V305L1204 307.5V338.5L1217.5 340.5V375L1204 378V423.5L1217.5 425.5V461.5L1204 464.5V487.5L1153.5 489.5V494.5H1116.5V492L1061.5 494.5V310.5H1122Z"
                    stroke="black"
                />
                <path
                    id="Vector 39"
                    d="M1053.5 495.5V311.5H1006.5V308.5H916.5V320H914.5V357H916.5V375H914.5V390.5H916.5V440H914.5V477H916.5V494H927V501.5H968.5V503L1004.5 501.5V498L1053.5 495.5Z"
                    stroke="black"
                />
                <g id="Vector 40">
                    <path
                        d="M1062.5 306V260H1054.5V211H1050V203H1054.5V98.5H885.5V45.5H877.5V34L729.5 51V74.5H739.5V116.5H731.5L735.5 189.5L877.5 177.5V163H885.5V153H927H990L1011.5 174V306H1062.5Z"
                        stroke="black"
                    />
                    <path
                        d="M213 311L211 264L271 258V267.5H286V254H304V240.5H309.5V237L352.5 233.5V240.5L367.5 239.5V233.5L409.5 231V237H433V240.5L448 239.5L445.5 197H437V154.5H443V137.5H435.5L434 96.5H440.5V74.5L540.5 71.5L599.5 64.5L605.5 208.5L658.5 205.5V208.5H668.5V212H675.5V214L679.5 258L671 259.5L672 288C674.833 288.833 680.7 290.5 681.5 290.5C682.3 290.5 682.167 321.167 682 336.5L675.5 338.5L677 368.5L685.5 369.5L687.5 413.5L680.5 415.5L682 447.5H690L692.5 492.5H684L685.5 513.5L646 516V519.5L603.5 522L604.5 518L537 521V525L493.5 527.5V525H464L458 415.5L436.5 417.5V424.5H443.5L448 527.5H422.5V532L382 535.5V532L296.5 537V547.5L248 551.5V541H226V501H221L219.5 467L222.5 465.5V440L296.5 435.5V427.5L221 433L217 369L274.5 365L276.5 392.5H294L290 329H276.5L274.5 308.5L213 311Z"
                        stroke="black"
                    />
                </g>
                <path
                    id="Vector 32"
                    d="M709.5 518.5L691 206.5L881.5 190L905.5 230V496H901V507.5L709.5 518.5Z"
                    fill="#DEB887"
                    fill-opacity="0.2"
                />
            </g>
            <WorkplaceWorkers getUserPictureUrl={getUserPictureUrl} />
        </svg>
    );
};

export const AllFloors = (props: Partial<WorkplaceSvgProps>) => {
    const { width, height, wallsColor, key, getUserPictureUrl, ...roomsProps } = {
        ...defaultProps,
        ...props,
    };

    const svgPropsAmesh = useRoom("SaintPaul_Amesh", roomsProps);
    const svgPropsLovelace = useRoom("SaintPaul_Lovelace", roomsProps);
    const svgPropsTuring = useRoom("SaintPaul_Turing", roomsProps);
    const svgPropsManguier = useRoom("SaintPaul_Manguier", roomsProps);
    const svgPropsTresor = useRoom("SaintPaul_Tresor", roomsProps);
    const svgPropsOlympe = useRoom("SaintPaul_Olympe", roomsProps);
    const svgPropsForet = useRoom("SaintPaul_Foret", roomsProps);
    const svgPropsMediterranee = useRoom("SaintPaul_Mediterranee", roomsProps);
    const svgPropsVador = useRoom("SaintPaul_Vador", roomsProps);
    const svgPropsPhoneBox = useRoom("SaintPaul_SuperPhoneBox", roomsProps);

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 2000 2360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g id="floor3">
                <g id="floor3-without-background">
                    <path
                        id="floor3background"
                        d="M1302.5 1106.5L1276 1059L1122.5 1073L1117.5 922.5L1595.5 877.5V1124.5V1363L1302.5 1378.5V1106.5Z"
                        fill="#EEEEEE"
                    />
                    <path
                        {...svgPropsAmesh}
                        d="M1506.5 1130.5H1586.5V1141.5H1598.5V1176.5H1586.5V1210H1598.5V1245.5H1586.5V1292.5H1598.5V1329.5H1586V1353.5L1536 1355.5V1358.5L1500 1360V1357.5L1447 1360V1181H1506.5V1130.5Z"
                        stroke="#333333"
                    />
                    <path
                        {...svgPropsManguier}
                        d="M1305.5 1177V1189H1299.5V1225H1305.5V1243H1302.5V1259H1305.5V1306.5H1299.5V1341.5H1305.5V1367L1356 1365.5V1368.5L1392 1367V1362.5L1439.5 1361V1177H1305.5Z"
                        stroke="#333333"
                    />
                    <path
                        {...svgPropsForet}
                        d="M1448 896L1487.5 892V899L1551.5 893.5V885.5L1586.5 881.5V918.5H1598.5V956H1586.5V1003.5H1598.5V1040H1586.5V1072.5H1598.5V1108.5H1586.5V1117H1447.5V896H1448Z"
                        stroke="#333333"
                    />
                    <path
                        {...svgPropsVador}
                        d="M1122.5 928.5L1128 1061.5H1136.5V1066.5L1171 1064V1058L1196.5 1056L1198.5 1061.5L1234 1058V1053.5L1259 1051V1047.5H1274.5V1026H1275.5H1276.5V912.5L1122.5 927.5V928.5Z"
                        stroke="#333333"
                    />
                    <g id="Vector 33">
                        <path d="M1385 968V899.5L1439 895.5V968H1385Z" stroke="black" />
                        <path d="M1339.5 968V904.5L1381 899.5V968H1339.5Z" stroke="black" />
                        <path d="M1335.5 968V905.5L1281 910V968H1335.5Z" stroke="black" />
                    </g>
                    <path
                        id="Vector 32"
                        d="M1101.5 1389.5L1083 1077.5L1273.5 1061L1297.5 1101V1367H1293V1378.5L1101.5 1389.5Z"
                        fill="#DEB887"
                        fill-opacity="0.5"
                    />
                    <path
                        id="Vector 41"
                        d="M1281 1026V974V973.5H1440V1118H1436V1119V1129.5H1448V1131V1176.5H1398V1047.5L1378 1026H1281Z"
                        stroke="black"
                    />
                </g>
            </g>
            <g id="floor2">
                <g id="floor-2-without-background">
                    <path
                        id="floor2background"
                        d="M1068 1999L1050 1680L1254 1660L1285.5 1709.5V1986L1582 1971V1482.5L809 1555L818 1704L834 2016L1068 2004V1999Z"
                        fill="#EEEEEE"
                    />
                    <path
                        id="Vector 32_2"
                        d="M1080.5 1997L1062 1685L1252.5 1668.5L1276.5 1708.5V1974.5H1272V1986L1080.5 1997Z"
                        fill="#DEB887"
                        stroke="#259D59"
                    />
                    <path
                        {...svgPropsTuring}
                        d="M1488.5 1786V1735.5H1556.5V1737.5H1570V1746.5H1581.5V1781.5H1570V1814.5H1581.5V1816.5V1851.5H1570V1897.5H1574.5V1899.5H1581.5V1936H1570V1937V1961.5H1569.5H1569H1568.5H1518V1962V1969.5H1481.5V1965.5L1428.5 1966.5V1786H1429.5H1488.5Z"
                        stroke="black"
                    />
                    <path
                        {...svgPropsLovelace}
                        d="M1429.5 1503.5V1721.5H1442.5V1731H1555.5V1724H1568.5V1715.5V1714.5L1575 1714V1677.5H1570L1569.5 1645.5V1644.5H1575L1575.5 1610.5H1569.5V1562H1575.5V1524.5H1569.5V1487.5L1429.5 1501V1503.5Z"
                        stroke="black"
                    />
                    <path
                        id="Vector 25"
                        d="M821 1578V1556.5L917 1553.5L978.5 1545.5L983 1675L856.5 1680V1682.5H828V1678.5L823 1677L821 1635H825.5L824.5 1619H819.5L818 1579.5L821 1578Z"
                        stroke="black"
                    />
                    <path
                        id="Vector 26"
                        d="M829.5 1714V1687.5L920 1684.5V1679.5H947.5V1682H984V1686L1038.5 1684.5V1686H1046.5V1690.5H1051L1052.5 1692L1054 1736.5H1051V1766H1057.5L1058.5 1811.5L1054 1813.5L1056 1843H1061L1064 1886.5L1058.5 1889.5V1916.5L1066.5 1920V1961.5L1064 1966V1986.5L847 1997.5V1993.5L837 1991.5V1971.5H845L840.5 1882.5H829.5V1854.5H837V1831L892.5 1828L888.5 1766L833 1769.5V1755.5H824L821 1714H829.5Z"
                        stroke="black"
                    />
                    <path
                        id="Vector 27"
                        d="M837 1826.5L834 1774L884 1771.5L887 1824L837 1826.5Z"
                        stroke="black"
                    />
                    <path
                        id="Vector 28"
                        d="M1288 1783H1379H1418.5H1421V1967L1374 1969V1973H1338.5V1971L1288 1973V1948.5H1281.5V1913H1288V1864H1284.5V1849H1288V1830.5H1281.5V1795H1288V1783Z"
                        stroke="black"
                    />
                    <path
                        id="Vector 29"
                        d="M1367 1574.5V1506.5L1421 1502V1574.5H1367Z"
                        stroke="black"
                    />
                    <path
                        id="Vector 30"
                        d="M1322 1574.5H1362.5V1520.5H1322V1574.5Z"
                        stroke="black"
                    />
                    <g id="Vector 31">
                        <path
                            d="M1262.5 1517.5V1575.5H1318V1574.5V1512.5L1262.5 1517.5Z"
                            stroke="black"
                        />
                        <path
                            d="M1103.5 1535V1557H1115V1578.5L1107 1579.5L1110 1668.5H1118.5V1673.5L1154 1670V1665L1179.5 1663V1668.5L1215.5 1665V1658.5L1248.5 1656V1643H1256.5V1633H1359.5L1379 1653V1776.5H1382V1782.5H1427.5V1737.5H1418V1725.5H1420.5V1579.5H1258V1535L1249 1532.5V1520L1103.5 1535Z"
                            stroke="black"
                        />
                    </g>
                </g>
            </g>
            <g id="floor4">
                <g id="floor4-without-background">
                    <path
                        id="floor3-background"
                        d="M389.5 862L371 580.5L662 545.5V532L806 517L798.5 376L1582 297V795.5L1286 806.5V524.5L1254 476.5L1045.5 501.5L1064 815L389.5 862Z"
                        fill="#EEEEEE"
                    />
                    <path
                        {...svgPropsTresor}
                        d="M370.5 581L380 707.5L426.5 702.5L496 626.5L490 601H480.5L475.5 569L370.5 581Z"
                        stroke="black"
                    />
                    <path
                        {...svgPropsMediterranee}
                        d="M491.5 569H495.5V563L517.5 561L518.5 565L571 558.5V563H577L580 607H577V612.5V614H582.5H585.5V660L514.5 664.5L483.5 698.5L456.5 676L495.5 631.5L491.5 569Z"
                        stroke="black"
                    />
                    <path
                        {...svgPropsPhoneBox}
                        d="M587 611L587.5 660L642.5 657L640.5 608.5L587 611Z"
                        stroke="black"
                    />
                    <path
                        {...svgPropsOlympe}
                        d="M487 703L517 670.5L578 667L588.5 842H584V847.5L544 848.5V851.5L496 854.5V851.5L488 736H489.5V723.5L487 722.5V703Z"
                        stroke="black"
                    />
                    <path
                        id="Vector 35"
                        d="M1321 390.5V323L1363.5 316V390.5H1321Z"
                        stroke="black"
                    />
                    <path
                        id="Vector 36"
                        d="M1367 390.5V316.5L1423.5 311.5V390.5H1367Z"
                        stroke="black"
                    />
                    <path
                        id="Vector 37"
                        d="M1432 540.5V315.5L1500 305.5V313.5L1514 311.5L1512.5 303.5L1565.5 297V299H1575.5V338H1587.5C1589.1 338 1588.17 363.333 1587.5 376H1575.5V426H1587.5V462.5H1575.5V464.5V496H1587.5V533.5H1574V542H1562V550.5H1524.5V542H1514V550.5H1445.5V540.5H1432Z"
                        stroke="black"
                    />
                    <path
                        id="Vector 38"
                        d="M1492 606.5V555V553.5H1561V556H1562.5H1574V565H1581.5V567H1587.5V601L1574 603.5V634.5L1587.5 636.5V671L1574 674V719.5L1587.5 721.5V757.5L1574 760.5V783.5L1523.5 785.5V790.5H1486.5V788L1431.5 790.5V606.5H1492Z"
                        stroke="black"
                    />
                    <path
                        id="Vector 39"
                        d="M1423.5 791.5V607.5H1376.5V604.5H1286.5V616H1284.5V653H1286.5V671H1284.5V686.5H1286.5V736H1284.5V773H1286.5V790H1297V797.5H1338.5V799L1374.5 797.5V794L1423.5 791.5Z"
                        stroke="black"
                    />
                    <g id="Vector 40">
                        <path
                            d="M1432.5 602V556H1424.5V507H1420V499H1424.5V394.5H1255.5V341.5H1247.5V330L1099.5 347V370.5H1109.5V412.5H1101.5L1105.5 485.5L1247.5 473.5V459H1255.5V449H1297H1360L1381.5 470V602H1432.5Z"
                            stroke="black"
                        />
                        <path
                            d="M583 607L581 560L641 554V563.5H656V550H674V536.5H679.5V533L722.5 529.5V536.5L737.5 535.5V529.5L779.5 527V533H803V536.5L818 535.5L815.5 493H807V450.5H813V433.5H805.5L804 392.5H810.5V370.5L910.5 367.5L969.5 360.5L975.5 504.5L1028.5 501.5V504.5H1038.5V508H1045.5V510L1049.5 554L1041 555.5L1042 584C1044.83 584.833 1050.7 586.5 1051.5 586.5C1052.3 586.5 1052.17 617.167 1052 632.5L1045.5 634.5L1047 664.5L1055.5 665.5L1057.5 709.5L1050.5 711.5L1052 743.5H1060L1062.5 788.5H1054L1055.5 809.5L1016 812V815.5L973.5 818L974.5 814L907 817V821L863.5 823.5V821H834L828 711.5L806.5 713.5V720.5H813.5L818 823.5H792.5V828L752 831.5V828L666.5 833V843.5L618 847.5V837H596V797H591L589.5 763L592.5 761.5V736L666.5 731.5V723.5L591 729L587 665L644.5 661L646.5 688.5H664L660 625H646.5L644.5 604.5L583 607Z"
                            stroke="black"
                        />
                    </g>
                    <path
                        id="Vector 32_3"
                        d="M1079.5 814.5L1061 502.5L1251.5 486L1275.5 526V792H1271V803.5L1079.5 814.5Z"
                        fill="#DEB887"
                        fill-opacity="0.2"
                    />
                </g>
            </g>
            <WorkplaceWorkers getUserPictureUrl={getUserPictureUrl} />
        </svg>
    );
};
