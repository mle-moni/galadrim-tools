export interface Room {
  id: string
  name: string
}

export interface Reservation {
  id: string
  roomId: string
  title: string
  startTime: Date
  endTime: Date
  color: string
  owner: string
}

export interface DragSelection {
  roomId: string
  startTime: Date
  endTime: Date
  isDragging: boolean
}

export interface LayoutEvent extends Reservation {
  top: number
  height: number
  left: number
  width: number
}
