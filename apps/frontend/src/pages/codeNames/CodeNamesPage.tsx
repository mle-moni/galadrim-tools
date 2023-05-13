import { Visibility, VisibilityOff } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { IconButton } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useMemo, useRef } from 'react'
import { CenteredDiv } from '../../reusableComponents/common/CenteredDiv'
import { RoundedLinks } from '../../reusableComponents/common/RoundedLinks'
import { CodeNamesStore } from './CodeNamesStore'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

export const CodeNamesPage = observer(() => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const store = useMemo(() => {
        if (!canvasRef.current) return null
        return new CodeNamesStore(canvasRef.current)
    }, [canvasRef.current])

    return (
        <>
            <RoundedLinks linkInfos={[{ Icon: BackIcon, link: '/' }]} />

            <CenteredDiv style={{ height: '80vh', flexDirection: 'column' }}>
                <canvas
                    ref={canvasRef}
                    style={{ borderRadius: 4, cursor: 'pointer', maxWidth: '80%' }}
                    id="canvas"
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    onClick={(e) => store?.onClick(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
                />

                {store !== null && <h1>{store.numberOfMatricesText}</h1>}

                {store !== null && store.filteredMatrices.length === 1 && (
                    <IconButton
                        onClick={() => {
                            store.setShowResult(!store.showResult)
                        }}
                    >
                        {store.showResult ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                )}
            </CenteredDiv>
        </>
    )
})

export default CodeNamesPage
