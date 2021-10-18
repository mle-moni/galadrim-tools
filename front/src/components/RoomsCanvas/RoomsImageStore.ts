import { AppStore } from '../../stores/AppStore'
import { AllRooms, isColliding, Point, Room } from './utils'

export class RoomsImageStore {
    private ctx: CanvasRenderingContext2D
    private image: HTMLImageElement
    constructor(private canvas: HTMLCanvasElement, private imagePath: string) {
        this.image = new Image()
        this.image.onload = () => {
            this.canvas.width = this.image.width
            this.canvas.height = this.image.height
            this.draw()
        }
        this.image.src = imagePath
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('could not get canvas 2d context')
        this.ctx = ctx
        this.setEvents()
    }
    getCollidingRoom(point: Point) {
        return AllRooms.find((room) => isColliding(point, room.rect))
    }
    mouseClick(event: MouseEvent) {
        const point = { x: event.offsetX, y: event.offsetY }
        const room = this.getCollidingRoom(point)
        if (!room) return
        AppStore.eventsStore.setRoomName(room.name)
    }
    mouseMove(event: MouseEvent) {
        const point = { x: event.offsetX, y: event.offsetY }
        const room = this.getCollidingRoom(point)
        if (room) {
            this.cursorPointer(true)
        } else {
            this.cursorPointer(false)
        }
        this.draw(room)
    }
    cursorPointer(add: boolean) {
        if (add) this.canvas.classList.add('pointer')
        else this.canvas.classList.remove('pointer')
    }
    setEvents() {
        this.canvas.addEventListener('mousemove', this.mouseMove.bind(this))
        this.canvas.addEventListener('click', this.mouseClick.bind(this))
    }
    cleanup() {
        this.canvas.removeEventListener('mousemove', this.mouseMove.bind(this))
        this.canvas.addEventListener('click', this.mouseClick.bind(this))
    }
    draw(room?: Room) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.drawImage(this.image, 0, 0)
        if (room) {
            const { rect, name } = room
            this.ctx.strokeStyle = AppStore.eventsStore.roomIsAvailable(name, new Date()) ? 'green' : 'red'
            const w = rect.p2.x - rect.p1.x
            const h = rect.p2.y - rect.p1.y
            this.ctx.strokeRect(rect.p1.x, rect.p1.y, w, h)
        }
    }
}
