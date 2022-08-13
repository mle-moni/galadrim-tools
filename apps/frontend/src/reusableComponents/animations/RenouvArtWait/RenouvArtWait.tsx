import { CSSProperties, useEffect, useRef } from 'react'
import { RenouvArtLogic } from './RenouvArtWaitLogic'

export type RenouvArtWaitProps = {
    speed?: number
    mainBallColor?: string
    style?: CSSProperties
}

export const RenouvArtWait = (props: RenouvArtWaitProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        if (!canvasRef.current) return
        const store = new RenouvArtLogic(canvasRef.current, props)
        return () => {
            store.cleanup()
        }
    }, [canvasRef.current, props])

    return <canvas style={props.style} width={200} height={200} ref={canvasRef} />
}
