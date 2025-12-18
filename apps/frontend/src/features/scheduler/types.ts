export interface Room {
    id: number;
    name: string;
}

export interface Reservation {
    id: number;
    roomId: number;
    title: string;
    startTime: Date;
    endTime: Date;
    color: string;
    owner: string;
    canEdit: boolean;
}

export interface DragSelection {
    roomId: number;
    startTime: Date;
    endTime: Date;
    isDragging: boolean;
}

export interface LayoutEvent extends Reservation {
    top: number;
    height: number;
    left: number;
    width: number;
}
