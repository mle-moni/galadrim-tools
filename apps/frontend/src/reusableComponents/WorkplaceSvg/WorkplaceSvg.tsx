import React, { useState } from 'react'

export type WorkplaceSvgRoom =
    | 'Work1'
    | 'Work2'
    | 'Work3'
    | 'Work4'
    | 'Toilets'
    | 'Kitchen'
    | 'Adier'
    | 'Corridor'
    | 'Vador'
    | 'Turing'
    | 'Coffre'
    | 'Debarras'
    | 'PetitCouloir'
    | 'Manguier'
    | 'Babyfoot'
    | 'Cube'
    | 'Arche'
    | 'Other'
    | 'Nantes_Boudoir'
    | 'Nantes_Cave'
    | 'Nantes_Torture'
    | 'Nantes_Placard'
    | 'SaintPaul_Amesh'
    | 'SaintPaul_Lovelace'
    | 'SaintPaul_Turing'
    | 'SaintPaul_Manguier'
    | 'SaintPaul_Tresor'
    | 'SaintPaul_Olympe'
    | 'SaintPaul_Foret'
    | 'SaintPaul_Mediterranee'
    | 'SaintPaul_Vador'

export interface WorkplaceSvgProps {
    width: number
    height: number
    wallsColor: string
    backgroundColor: (room: WorkplaceSvgRoom) => string
    backgroundColorHover: (room: WorkplaceSvgRoom) => string
    onClick: (room: WorkplaceSvgRoom) => void
    onMouseOut: (room: WorkplaceSvgRoom) => void
    onMouseOver: (room: WorkplaceSvgRoom) => void
    style: (room: WorkplaceSvgRoom) => React.CSSProperties
    key: string | undefined
}

const defaultProps: Required<WorkplaceSvgProps> = {
    width: 991,
    height: 812,
    wallsColor: '#0A192F',
    backgroundColor: () => '#F2F6FB',
    backgroundColorHover: () => '#E2E6EB',
    onClick: () => ({}),
    onMouseOut: () => ({}),
    onMouseOver: () => ({}),
    style: () => ({}),
    key: undefined,
}


const useRoom = (room: WorkplaceSvgRoom, {
    backgroundColor,
    backgroundColorHover,
    onClick,
    onMouseOut,
    onMouseOver,
    style,
}: Pick<WorkplaceSvgProps,
    | 'backgroundColor'
    | 'backgroundColorHover'
    | 'onClick'
    | 'onMouseOut'
    | 'onMouseOver'
    | 'style'
>) => {
    const [color, setColor] = useState(backgroundColor(room))

    return {
        fill: color,
        onMouseOver: () => {
            setColor(backgroundColorHover(room))
            onMouseOver(room)
        },
        onMouseOut: () => {
            setColor(backgroundColor(room))
            onMouseOut(room)
        },
        cursor: 'pointer',
        onClick: () => onClick(room),
        style: {
            transition: 'all 0.2s',
            ...style(room),
        },
    }
}

export const WorkplaceSvg = (props: Partial<WorkplaceSvgProps>) => {
    const {
        width,
        height,
        wallsColor,
        key,
        ...roomsProps
    } = {
        ...defaultProps,
        ...props,
    }

    const { backgroundColor } = roomsProps;
    const Doors = () => (
        <>
            <rect x="202" y="348" width="4" height="12" fill={backgroundColor('Other')} />
            <rect x="259" y="385" width="4" height="13" fill={backgroundColor('Other')} />
            <rect x="329" y="395" width="4" height="26" fill={backgroundColor('Other')} />
            <rect x="112" y="391" width="2" height="22" fill={backgroundColor('Other')} />
            <rect x="97" y="520" width="12" height="4" fill={backgroundColor('Other')} />
            <rect x="129" y="520" width="21" height="4" fill={backgroundColor('Other')} />
            <rect x="87" y="569" width="4" height="25" fill={backgroundColor('Other')} />
            <rect x="106" y="605" width="13" height="4" fill={backgroundColor('Other')} />
            <rect x="129" y="757" width="4" height="28" fill={backgroundColor('Other')} />
            <rect x="335" y="778" width="4" height="16" fill={backgroundColor('Other')} />
            <rect x="502" y="772" width="4" height="16" fill={backgroundColor('Other')} />
            <rect x="414" y="610" width="38" height="4" fill={backgroundColor('Other')} />
            <rect x="335" y="574" width="4" height="19" fill={backgroundColor('Other')} />
            <rect x="535" y="610" width="11" height="4" fill={backgroundColor('Other')} />
            <rect x="523" y="532" width="4" height="21" fill={backgroundColor('Other')} />
            <rect x="532" y="565" width="14" height="4" fill={backgroundColor('Other')} />
            <rect x="544" y="522" width="19" height="4" fill={backgroundColor('Other')} />
            <rect x="771" y="524" width="11" height="34" fill={backgroundColor('Other')} />
            <rect x="686" y="522" width="19" height="4" fill={backgroundColor('Other')} />
            <rect x="603" y="578" width="4" height="11" fill={backgroundColor('Other')} />
            <rect x="506" y="401" width="4" height="24" fill={backgroundColor('Other')} />
            <rect x="286" y="555" width="26" height="4" fill={backgroundColor('Other')} />
            <rect
                id="Rectangle 103"
                x="455"
                y="567"
                width="2"
                height="43"
                fill={backgroundColor('Other')}
            />
            <rect
                id="Rectangle 104"
                x="457"
                y="567"
                width="45"
                height="2"
                fill={backgroundColor('Other')}
            />
        </>
    )

    const Work23Walls = () => (
        <path
            // this key could be set on any path but why not here
            key={key}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.05176e-05 609L0 808V812H502.001V808H339V794H338V793H336V794H335V808H133V785H132V784H130V785H129V808H4.00003V609H3.05176e-05ZM129 757L129.007 609L133.007 609L133 757L132 757V758H130V757H129ZM329 764V614H345V764H339V778H338V779H336V778H335V764H329ZM336 783H338V781H336V783ZM336 785V787H338V785H336ZM336 789V791H338V789H336ZM130 762V760H132V762H130ZM130 766V764H132V766H130ZM130 770V768H132V770H130ZM130 774V772H132V774H130ZM130 778V776H132V778H130ZM130 782V780H132V782H130ZM503 772V773H505V772H503ZM505 775H503V777H505V775ZM505 779H503V781H505V779ZM505 783H503V785H505V783ZM503 787V788H505V787H503Z"
            fill={wallsColor}
        />
    )

    const KitchenDoor = () => (
        <line
            x1="239"
            y1="159"
            x2="206"
            y2="159"
            stroke={wallsColor}
            strokeWidth="2"
            strokeDasharray="2 2"
        />
    )

    const Work2 = () => {
        const svgProps = useRoom('Work2', roomsProps)
        return <rect x="4" y="609" width="125" height="199" {...svgProps} />
    }

    const Work3 = () => {
        const svgProps = useRoom('Work3', roomsProps)
        return (
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M133 558H286V559H335V606V808H286H133V558Z"
                {...svgProps}
            />
        )
    }

    const Work4 = () => {
        const svgProps = useRoom('Work4', roomsProps)
        return <rect x="339" y="614" width="163" height="194" {...svgProps} />
    }

    const Toilets = () => {
        const svgProps = useRoom('Toilets', roomsProps)
        return (
            <>
                <path d="M170 312H202V375H170V312Z" {...svgProps} />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M171 374.998V313H201V305H171H166H163V379H171L206 378L205.971 377H206V360H205V359H203V360H202V374.113L171 374.998ZM206 333V348H205V349H203V348H202V333H206ZM203 353V351H205V353H203ZM203 357V355H205V357H203Z"
                    fill={wallsColor}
                />
            </>
        )
    }

    const Kitchen = () => {
        const svgProps = useRoom('Kitchen', roomsProps)
        return (
            <>
                <path d="M205 6H349V158H205V6Z" {...svgProps} />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M205 7.99999L348 8V158H239V166H348H356V158V8V0H197V8L205 7.99999ZM205 7.99999L206 158L198 158.053L197 8.05333L205 7.99999Z"
                    fill={wallsColor}
                />
            </>
        )
    }

    const Adier = () => {
        const svgProps = useRoom('Adier', roomsProps)
        return (
            <>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M259 376H247H230V377H206V378H171V379H114V520H247V478H259V376Z"
                    {...svgProps}
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M163 375H112V379H112V390V391H114V390V379H163V375ZM114 520V414V413H112V414V520H114ZM114 411V409H112V411H114ZM114 407V405H112V407H114ZM114 403V401H112V403H114ZM114 399V397H112V399H114ZM114 395V393H112V395H114Z"
                    fill={wallsColor}
                />
            </>
        )
    }

    const Corridor = () => {
        const svgProps = useRoom('Corridor', roomsProps)
        return (
            <>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M206 158H230H235H239V172H235V187H230V333H263H341V377H329V555H263H129V605H91V555V524H263V377V374H230H206V333V158Z"
                    {...svgProps}
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M198 158V333H206V158H198ZM345 329H233V199.877L246.347 161.116L238.782 158.511L225.185 198H225V333H233H341V377H329V387V395H330V395.929H332V395H333V387H345V377V333V329ZM204 374L263 372L263.136 375.998L263 376.002V385H262V386.083H260V385H259V376.138L204.136 377.998L204 374ZM263 478V398H262V396.917H260V398H259V478H247V520H150V521H148.95V523H150V524H247H263V478ZM260 390.417V388.25H262V390.417H260ZM260 394.75V392.583H262V394.75H260ZM129 520H109V521H108V523H109V524H129V523H130.05V521H129V520ZM144.75 521H146.85V523H144.75V521ZM140.55 521H142.65V523H140.55V521ZM136.35 521H138.45V523H136.35V521ZM132.15 521H134.25V523H132.15V521ZM106 521H104V523H106V521ZM102 521H100V523H102V521ZM98 521H97V520H91H75V546H87V569H88V570.042H90V569H91V546V524H97V523H98V521ZM87 594V609H90H91H106V608H107.083V606H106V605H91V594H90V592.958H88V594H87ZM88 574.208V572.125H90V574.208H88ZM88 578.375V576.292H90V578.375H88ZM88 582.542V580.458H90V582.542H88ZM88 586.708V584.625H90V586.708H88ZM88 590.875V588.792H90V590.875H88ZM129 609H119V608H117.917V606H119V605H129V558V556H129.013L129.025 554L286.025 555L286.019 556H286.929V558H286.006L286 559L133 558.025V609H131H129ZM312 559H329H345V433H333V421H332V420.071H330V421H329V433V555H312V556H311.071V558H312V559ZM111.417 608H109.25V606H111.417V608ZM115.75 608H113.583V606H115.75V608ZM288.786 558H290.643V556H288.786V558ZM292.5 558H294.357V556H292.5V558ZM296.214 558H298.071V556H296.214V558ZM299.929 558H301.786V556H299.929V558ZM303.643 558H305.5V556H303.643V558ZM307.357 558H309.214V556H307.357V558ZM332 416.357V418.214H330V416.357H332ZM332 412.643V414.5H330V412.643H332ZM332 408.929V410.786H330V408.929H332ZM332 405.214V407.071H330V405.214H332ZM332 401.5V403.357H330V401.5H332ZM332 397.786V399.643H330V397.786H332Z"
                    fill={wallsColor}
                />
            </>
        )
    }

    const Vador = () => {
        const svgProps = useRoom('Vador', roomsProps)
        return (
            <>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 375H112V379H4V605H88V609H4H2H0V379V375Z"
                    fill={wallsColor}
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4 379H112V520H75V546H87V605H4V546V520V379Z"
                    {...svgProps}
                />
            </>
        )
    }

    const Work1 = () => {
        const svgProps = useRoom('Work1', roomsProps)
        return (
            <>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M345 387H506V401H507V402H509V401H510V383H508H506H345V387ZM339 559V574H338V574.95H336V574H335V559H339ZM339 593V606H345V610H414V611H414.95V613H414V614H345H329V606H335V593H336V592.05H338V593H339ZM452 614H502H506V576H527V562V560V553H526V551.95H524V553H523V560H502V564V576V610H452V611H451.05V613H452V614ZM506 425V438H510H523V532H524V533.05H526V532H527V434H526H523H510V425H509V424H507V425H506ZM524 537.25V535.15H526V537.25H524ZM524 541.45V539.35H526V541.45H524ZM524 545.65V543.55H526V545.65H524ZM524 549.85V547.75H526V549.85H524ZM507 404V406H509V404H507ZM507 408V410H509V408H507ZM507 412V414H509V412H507ZM507 416V418H509V416H507ZM507 420V422H509V420H507ZM336 578.75V576.85H338V578.75H336ZM336 582.55V580.65H338V582.55H336ZM336 586.35V584.45H338V586.35H336ZM336 590.15V588.25H338V590.15H336ZM416.85 613H418.75V611H416.85V613ZM420.65 613H422.55V611H420.65V613ZM424.45 613H426.35V611H424.45V613ZM428.25 613H430.15V611H428.25V613ZM432.05 613H433.95V611H432.05V613ZM435.85 613H437.75V611H435.85V613ZM439.65 613H441.55V611H439.65V613ZM443.45 613H445.35V611H443.45V613ZM447.25 613H449.15V611H447.25V613Z"
                    fill={wallsColor}
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M333 387H506V433V438H523V560H502V610H345V606H339V559H345V438V433H333V387Z"
                    {...svgProps}
                />
            </>
        )
    }

    const Turing = () => {
        const svgProps = useRoom('Turing', roomsProps)
        return (
            <>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M654 387H510V434L527 434V522H654V434V387Z"
                    {...svgProps}
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M654 387.986L510 387L510.027 383L656.014 384H658V526H654H563V525H562.05V523H563V522H654V387.986ZM544 526H527V522H544V523H544.95V525H544V526ZM546.85 525H548.75V523H546.85V525ZM550.65 525H552.55V523H550.65V525ZM554.45 525H556.35V523H554.45V525ZM558.25 525H560.15V523H558.25V525Z"
                    fill={wallsColor}
                />
            </>
        )
    }

    const Coffre = () => {
        const svgProps = useRoom('Coffre', roomsProps)
        return (
            <>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M506 614H554V648H558V662H560V674H562V678H564V689H567V702H570V714H573V727H575V739V770H585V781H588V795H591V808H554H506V614Z"
                    {...svgProps}
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M528 626H506V772H502V626V610H528H535V614H528V626ZM546 614H554V648L575.189 740.199L563 743L571.527 780.112L583.717 777.311L590.77 808H506V788H502V812H506H595V808H594.874L558 647.546V610H554H546V614Z"
                    fill={wallsColor}
                />
            </>
        )
    }

    const Debarras = () => {
        const svgProps = useRoom('Debarras', roomsProps)
        return (
            <>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M649 575H658V603H626V607H658V636H612.182L607 613.544V607H612V603H607V589H606V588.083H604V589H603V598H558V588H554V610H558V614H603L609 640H658H662V575H670V559H649V565H607H558H555H554H546V566H545.125V568H546V569H554V576H558V569H603V578H604V578.917H606V578H607V569H649V575ZM527 569H532V568H532.875V566H532V565H527V569ZM535 613H535.917V611H535V613ZM537.75 613H539.583V611H537.75V613ZM541.417 613H543.25V611H541.417V613ZM545.083 613H546V611H545.083V613ZM536.375 568H534.625V566H536.375V568ZM539.875 568H538.125V566H539.875V568ZM543.375 568H541.625V566H543.375V568ZM604 580.75V582.583H606V580.75H604ZM604 584.417V586.25H606V584.417H604Z"
                    fill={wallsColor}
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M527 569H554H603V598H554V610H527H506V576H527V569ZM607 569H658V603H626V607H658V636H610V627H607V607H610H611H612V603H607V569Z"
                    {...svgProps}
                />
            </>
        )
    }

    const PetitCouloir = () => {
        const svgProps = useRoom('PetitCouloir', roomsProps)
        return (
            <>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M707.281 525.736L707.368 526H670H527V565H670V571H771H781V559H778.305L771 524.37V514H769.163L769.644 513.167L765.644 514H761V514.967L743.374 518.635L743.644 518.167L707.281 525.736Z"
                    {...svgProps}
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M769 514L771.086 525.209L772.008 525.038L772.194 525.972L774.156 525.58L773.974 524.672L775.018 524.478L772.933 513.268L769 514ZM670 575H785V571H784.877L781.911 557.162L778 558L780.786 571H670V575ZM772.583 527.917L772.972 529.861L774.933 529.469L774.544 527.524L772.583 527.917ZM773.361 531.806L773.75 533.75L775.711 533.358L775.322 531.413L773.361 531.806ZM774.139 535.694L774.528 537.639L776.489 537.247L776.1 535.302L774.139 535.694ZM774.917 539.583L775.306 541.528L777.267 541.136L776.878 539.191L774.917 539.583ZM775.694 543.472L776.083 545.417L778.044 545.024L777.656 543.08L775.694 543.472ZM776.472 547.361L776.861 549.306L778.822 548.913L778.433 546.969L776.472 547.361ZM777.25 551.25L777.639 553.194L779.6 552.802L779.211 550.858L777.25 551.25ZM778.028 555.139L778.417 557.083L780.378 556.691L779.989 554.747L778.028 555.139Z"
                    fill={wallsColor}
                />
            </>
        )
    }

    const Manguier = () => {
        const svgProps = useRoom('Manguier', roomsProps)
        return (
            <>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M658 388H749V407H752V423H755V439H757V449H760V464H763V481H766V499H769V512H761V514H750V517H736V520H721V522H670V430H658V388Z"
                    {...svgProps}
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M745.558 388H658V384H749V384.631L772.933 513.268L769 514L745.558 388ZM769 514L768.228 510.075L707.61 522H705V523H704.05V525H705V526H708L769 514ZM654 526V430H670V522H686V523H686.95V525H686V526H670H654ZM690.75 525H688.85V523H690.75V525ZM694.55 525H692.65V523H694.55V525ZM698.35 525H696.45V523H698.35V525ZM702.15 525H700.25V523H702.15V525Z"
                    fill={wallsColor}
                />
            </>
        )
    }

    const Babyfoot = () => {
        const svgProps = useRoom('Babyfoot', roomsProps)
        return (
            <>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M926 466.383L960.44 460L964.295 480.796L962.567 481.116L964.156 489.69L963.718 489.771L973.984 545.163L972.952 545.354L981.984 594.087L981 594.269L988.725 635.95L936.085 645.706L933.087 629.533L819.243 645.532L805.386 648.988L791.113 591.743L789.377 592.112L782.149 558.105L782.117 558.112L774.888 524.104L774.823 524.116L772.709 512.711L886.86 491.554L886.979 492.196L929.329 484.347L926 466.383Z"
                    {...svgProps}
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M963 462L962.293 458.063L923.293 465.063L924 469L924.111 468.98L926.365 481.755L771.306 509.061L772 513L927.061 485.694L927.061 485.695L931 485L930.306 481.061L930.305 481.061L928.048 468.273L959.062 462.707L986.045 635.597L937.107 642.984L934 629L933.281 629.16L805.958 645.683L782.856 561.936L779 563L802.975 649.911L803 650.1L930.903 633.502L934.095 647.868L938 647L937.977 646.898L990.597 638.955L990 635L963 462Z"
                    fill={wallsColor}
                />
            </>
        )
    }

    const Cube = () => {
        const svgProps = useRoom('Cube', roomsProps)

        return (
            <>
                <line
                    id="Line 128"
                    x1="180"
                    y1="559"
                    x2="180"
                    y2="600"
                    stroke={wallsColor}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                />
                <line
                    id="Line 129"
                    x1="134"
                    y1="600"
                    x2="180"
                    y2="600"
                    stroke={wallsColor}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                />
                <rect id="Rectangle 102" x="133" y="558" width="46" height="41" {...svgProps} />
            </>
        )
    }

    const Arche = () => {
        const svgProps = useRoom('Arche', roomsProps)
        return (
            <>
                <line
                    id="Line 130"
                    x1="392"
                    y1="434"
                    x2="392"
                    y2="475"
                    stroke={wallsColor}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                />
                <line
                    id="Line 131"
                    x1="346"
                    y1="475"
                    x2="392"
                    y2="475"
                    stroke={wallsColor}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                />
                <line
                    id="Line 132"
                    x1="346"
                    y1="432"
                    x2="392"
                    y2="432"
                    stroke={wallsColor}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                />
                <rect id="Rectangle 102" x="345" y="433" width="46" height="41" {...svgProps} />
            </>
        )
    }

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 991 812"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <Doors />
            <Work2 />
            <Work3 />
            <Work4 />
            <Toilets />
            <Kitchen />
            <Adier />
            <Corridor />
            <Vador />
            <Work1 />
            <Turing />
            <Coffre />
            <Debarras />
            <PetitCouloir />
            <Manguier />
            <Babyfoot />
            <Work23Walls />
            <KitchenDoor />
            <Cube />
            <Arche />
        </svg>
    )
}

const PORTRAIT_SIZE = 60;

export const WorkplaceSaintPaulSvg = (props: Partial<WorkplaceSvgProps> & {
    getUserPictureUrl: (room: WorkplaceSvgRoom) => string | null
}) => {
    const {
        width,
        height,
        wallsColor,
        key,
        getUserPictureUrl,
        ...roomsProps
    } = {
        ...defaultProps,
        ...props,
    }

    const roomToId = {
        SaintPaul_Amesh: 'amesh',
        SaintPaul_Lovelace: 'lovelace',
        SaintPaul_Turing: 'turing',
        SaintPaul_Manguier: 'manguier',
        SaintPaul_Tresor: 'tresor',
        SaintPaul_Olympe: 'olympe',
        SaintPaul_Foret: 'foret',
        SaintPaul_Mediterranee: 'mediterranee',
        SaintPaul_Vador: 'vador',
    }

    const svgPropsAmesh = useRoom('SaintPaul_Amesh', roomsProps);
    const svgPropsLovelace = useRoom('SaintPaul_Lovelace', roomsProps);
    const svgPropsTuring = useRoom('SaintPaul_Turing', roomsProps);
    const svgPropsManguier = useRoom('SaintPaul_Manguier', roomsProps);
    const svgPropsTresor = useRoom('SaintPaul_Tresor', roomsProps);
    const svgPropsOlympe = useRoom('SaintPaul_Olympe', roomsProps);
    const svgPropsForet = useRoom('SaintPaul_Foret', roomsProps);
    const svgPropsMediterranee = useRoom('SaintPaul_Mediterranee', roomsProps);
    const svgPropsVador = useRoom('SaintPaul_Vador', roomsProps);

    return (
        <svg width={width} height={height} viewBox="0 0 2000 2660" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="floor4">
                <path id="floor3-background" d="M389.5 2362L371 2080.5L662 2045.5V2032L806 2017L798.5 1876L1582 1797V2295.5L1286 2306.5V2024.5L1254 1976.5L1045.5 2001.5L1064 2315L389.5 2362Z" fill="#EEEEEE" />
                <path id={roomToId['SaintPaul_Olympe']} d="M482.5 2204L493 2355L595.5 2347.5L581 2162.5L517.5 2166L482.5 2204Z" {...svgPropsOlympe} />
                <path id={roomToId['SaintPaul_Mediterranee']} d="M482 2100.5L475.5 2068.5L578 2055L585 2162.5L516 2165.5L484 2201.5L455 2176L496 2128L491.5 2100.5H482Z" {...svgPropsMediterranee} />
                <path id={roomToId['SaintPaul_Tresor']} d="M370.5 2081L380 2207.5L426.5 2202.5L496 2126.5L490 2101H480.5L475.5 2069L370.5 2081Z" {...svgPropsTresor} />
                <g id="floor3-walls">
                    <path id="floor3-walls_2" d="M389.5 2362L371 2080.5L662 2045.5V2032L806 2017L798.5 1876L1582 1797V2295.5L1286 2306.5V2024.5L1254 1976.5L1045.5 2001.5L1064 2315L389.5 2362Z" stroke="black" stroke-width="6" />
                    <path id="Vector 2" d="M476.5 2070L481.5 2100H489.5L494.5 2127.5L481.5 2140.5" stroke="black" stroke-width="6" />
                    <path id="Vector 1" d="M380 2208.5L425.5 2204L462 2167" stroke="black" stroke-width="6" />
                    <path id="Vector 3" d="M492.5 2355.5L482.5 2203L516 2165.5L643.5 2158.5V2107H581.5" stroke="black" stroke-width="6" />
                    <path id="Vector 4" d="M582.5 2200.5L585 2231M587.5 2261.5L585 2231M585 2231H621" stroke="black" stroke-width="6" />
                    <path id="Vector 5" d="M589 2300.5L594.5 2346" stroke="black" stroke-width="6" />
                    <path id="Vector 6" d="M819 2217L826.5 2330.5" stroke="black" stroke-width="6" />
                    <path id="Vector 7" d="M699.5 2099L704.5 2171.5L810.5 2164.5" stroke="black" stroke-width="6" />
                    <path id="Vector 8" d="M853.5 2087H873L879 2148H825" stroke="black" stroke-width="6" />
                    <path id="Vector 9" d="M879 2072.5L1045.5 2061" stroke="black" stroke-width="6" />
                    <path id="Vector 10" d="M1426 2228V2301.5" stroke="black" stroke-width="6" />
                    <path id="Vector 11" d="M1429 2176.5V2195.5" stroke="black" stroke-width="6" />
                    <path id="Vector 12" d="M1429 2130V2102.5H1490.5V2051H1474" stroke="black" stroke-width="6" />
                    <path id="Vector 20" d="M1491 2051.5H1426.5V1952.5" stroke="black" stroke-width="6" />
                    <path id="Vector 13" d="M1287 2098H1381V1973.5L1358 1952.5H1298.5" stroke="black" stroke-width="6" />
                    <path id="Vector 14" d="M1427.5 1815V1921.5" stroke="black" stroke-width="6" />
                    <path id="Vector 15" d="M1365.5 1821V1893.5" stroke="black" stroke-width="6" />
                    <path id="Vector 17" d="M1258 1828V1891.5" stroke="black" stroke-width="6" />
                    <path id="Vector 18" d="M1320.5 1829V1898H1292.5H1325.5" stroke="black" stroke-width="6" />
                    <path id="Vector 19" d="M1356.5 1892H1392" stroke="black" stroke-width="6" />
                    <path id="Vector 21" d="M1491 2051H1529" stroke="black" stroke-width="6" />
                    <path id="Vector 22" d="M1581.5 2051H1567" stroke="black" stroke-width="6" />
                    <path id="Vector 23" d="M1093.5 1847.5L1099.5 1942.5" stroke="black" stroke-width="6" />
                    <path id="Vector 24" d="M972 1859L976.5 1948.5M976.5 1948.5L1060 1942.5M976.5 1948.5L981 2002" stroke="black" stroke-width="6" />
                </g>
            </g>
            <g id="floor3">
                <path id="floor3background" d="M432.5 1549.5L410.5 1273.5L609 1246L695 1237.5V1226.5L839 1216.5L826.5 1071L1595.5 997.5V1483L1302.5 1498.5V1226.5L1276 1179L1071 1198.5L1090.5 1513.5L432.5 1549.5Z" fill="#EEEEEE" />
                <path id={roomToId['SaintPaul_Foret']} d="M1596 997.5V1244.5H1442.5V1011L1596 997.5Z" {...svgPropsForet} />
                <path id={roomToId['SaintPaul_Amesh']} d="M1504.5 1243.5V1298H1442L1445 1491L1596 1483.5V1243.5H1504.5Z" {...svgPropsAmesh} />
                <path id={roomToId['SaintPaul_Manguier']} d="M1302.5 1292.5V1500L1442 1492V1297L1302.5 1292.5Z" {...svgPropsManguier} />
                <path id={roomToId['SaintPaul_Vador']} d="M1126 1193.5L1118.5 1043L1278 1026.5V1179.5L1126 1193.5Z" {...svgPropsVador} />
                <path id="floor3walls" d="M1444.5 1013V1088M1444 1414.5V1491M1443 1364.5V1389.5M1504.5 1245V1297.5H1443V1327.5M1442 1161V1244.5H1595.5M1303.5 1292.5H1395.5V1167L1373 1149H1318M410.5 1273.5L432.5 1549.5L1090.5 1513.5L1071 1198.5L1276 1179L1302.5 1226.5V1498.5L1595.5 1483V997.5L826.5 1071L839 1216.5L695 1226.5V1237.5L609 1246L410.5 1273.5Z" stroke="black" stroke-width="6" />
            </g>
            <g id="floor2">
                <path id="floor2background" d="M412 840L390.5 558L590 537V530L679 522V509.5L818 504L809 355L1582 282.5V771L1285.5 786V509.5L1254 460L1050 480L1068 799L412 840Z" fill="#EEEEEE" />
                <path id={roomToId['SaintPaul_Turing']} d="M1428 779L1581 771V531H1485V587H1428V779Z" stroke="black" stroke-width="6" {...svgPropsTuring} />
                <path id={roomToId['SaintPaul_Lovelace']} d="M1426 297V531H1581V281L1426 297Z" stroke="black" stroke-width="6" {...svgPropsLovelace} />
                <path id="floor2walls" d="M412 840L390.5 558L590 537V530L679 522V509.5L818 504L809 355L1582 282.5V771L1285.5 786V509.5L1254 460L1050 480L1068 799L412 840Z" stroke="black" stroke-width="6" />
            </g>

            {Object.entries(roomToId).map(([roomName, roomId]) => {
                const userPicture = getUserPictureUrl(roomName as WorkplaceSvgRoom);

                if (!userPicture) {
                    return null;
                }

                const roomElement = document.getElementById(roomId) as SVGGraphicsElement | null;
                if (roomElement === null) {
                    return null;
                }

                const boundingBox = roomElement.getBBox()

                return (
                    <foreignObject x={boundingBox.x + boundingBox.width / 2 - PORTRAIT_SIZE/2} y={boundingBox.y + boundingBox.height / 2 - PORTRAIT_SIZE/2} width={`${PORTRAIT_SIZE}px`} height={`${PORTRAIT_SIZE}px`}>
                        <img
                            width={`${PORTRAIT_SIZE}px`}
                            height={`${PORTRAIT_SIZE}px`}
                            src={userPicture}
                            style={{ borderRadius: '50%' }}
                        />
                    </foreignObject>
                )
            })}
        </svg>
    )
}
