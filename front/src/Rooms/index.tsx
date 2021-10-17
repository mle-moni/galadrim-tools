import { useEffect, useRef } from 'react'
import RoomsImage from './rooms.png'
import { RoomsImageStore } from './RoomsImageStore'

export const Rooms = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        if (!canvasRef.current) return
        const store = new RoomsImageStore(canvasRef.current, RoomsImage)
        return () => {
            store.cleanup()
        }
    }, [canvasRef.current])

    return <canvas className="pointer" ref={canvasRef} />
}
