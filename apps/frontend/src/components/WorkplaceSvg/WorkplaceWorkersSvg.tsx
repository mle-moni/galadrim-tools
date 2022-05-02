import type { WorkplaceSvgRoom } from './WorkplaceSvg';

interface WorkplaceWorkersSvgProps {
    width?: number;
    height?: number;
    getUserPictureUrl: (room: WorkplaceSvgRoom) => string | null;
}

export const WorkplaceWorkersSvg = ({
    getUserPictureUrl,
    height = 812,
    width = 991,
}: WorkplaceWorkersSvgProps) => {
    const userPictureTuring = getUserPictureUrl('Turing');
    const userPictureAdier = getUserPictureUrl('Adier');
    const userPictureVador = getUserPictureUrl('Vador');
    const userPictureKitchen = getUserPictureUrl('Kitchen');
    const userPictureCoffre = getUserPictureUrl('Coffre');
    const userPictureManguier = getUserPictureUrl('Manguier');

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 991 812"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                position: 'absolute',
                pointerEvents: 'none',
            }}
        >
            {userPictureTuring && (
                <foreignObject x="564" y="432" width="56px" height="56px">
                    <img
                        width="48px"
                        height="48px"
                        src={userPictureTuring}
                        style={{ borderRadius: '50%' }}
                    />
                </foreignObject>
            )}
            {userPictureAdier && (
                <foreignObject x="160" y="425" width="56px" height="56px">
                    <img
                        width="48px"
                        height="48px"
                        src={userPictureAdier}
                        style={{ borderRadius: '50%' }}
                    />
                </foreignObject>
            )}
            {userPictureVador && (
                <foreignObject x="32" y="425" width="56px" height="56px">
                    <img
                        width="48px"
                        height="48px"
                        src={userPictureVador}
                        style={{ borderRadius: '50%' }}
                    />
                </foreignObject>
            )}
            {userPictureKitchen && (
                <foreignObject x="250" y="60" width="56px" height="56px">
                    <img
                        width="48px"
                        height="48px"
                        src={userPictureKitchen}
                        style={{ borderRadius: '50%' }}
                    />
                </foreignObject>
            )}
            {userPictureCoffre && (
                <foreignObject x="515" y="700" width="56px" height="56px">
                    <img
                        width="48px"
                        height="48px"
                        src={userPictureCoffre}
                        style={{ borderRadius: '50%' }}
                    />
                </foreignObject>
            )}
            {userPictureManguier && (
                <foreignObject x="690" y="438" width="56px" height="56px">
                    <img
                        width="48px"
                        height="48px"
                        src={userPictureManguier}
                        style={{ borderRadius: '50%' }}
                    />
                </foreignObject>
            )}
        </svg>
    );
};
