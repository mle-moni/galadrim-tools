import { Fab, SvgIconTypeMap } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { FC } from 'react'
import { AppStore } from '../../stores/AppStore'

interface LinkInfo {
    Icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>> & {
        muiName: string
    }
    link: string
    hidden?: boolean
}

const POS_TOP = 32
const POS_LEFT = 32
const POS_INCREMENT = 64

export const RoundedLinks: FC<{ linkInfos: LinkInfo[] }> = ({ linkInfos }) => {
    const visibleLinks = linkInfos.filter(({ hidden }) => hidden !== true)

    return (
        <>
            {visibleLinks.map(({ link, Icon }, index) => (
                <Fab
                    key={link}
                    size="medium"
                    variant="circular"
                    color="primary"
                    onClick={() => AppStore.navigate(link)}
                    sx={{
                        position: 'absolute',
                        top: POS_TOP + POS_INCREMENT * index,
                        left: POS_LEFT,
                    }}
                >
                    <Icon />
                </Fab>
            ))}
        </>
    )
}
