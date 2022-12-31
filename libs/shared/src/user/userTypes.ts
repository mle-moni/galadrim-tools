import { IRestaurant } from '../saveur'

export interface INotification {
    id: number
    userId: number
    text: string
    link: string | null
}

export interface IUserData {
    id: number
    username: string
    socketToken: string
    imageUrl: string
    rights: number
    notificationsSettings: number
    email: string
    dailyChoice: IRestaurant['id'] | null
    notifications: INotification[]
}
