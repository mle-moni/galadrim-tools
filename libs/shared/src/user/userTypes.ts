import { IRestaurant } from '../saveur'

export interface INotification {
    id: number
    userId: number
    read: boolean
    title: string
    text: string
    link: string | null
    createdAt: string
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
