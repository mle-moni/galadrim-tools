import type { IRestaurant } from "./saveur";

export interface INotification {
    id: number;
    userId: number;
    read: boolean;
    title: string;
    text: string;
    link: string | null;
    createdAt: string;
}

export interface ITheme {
    id: number;
    name: string;
    myEventsBg: string;
    myEventsBorder: string;
    myEventsText: string;
    otherEventsBg: string;
    otherEventsBorder: string;
    otherEventsText: string;
    createdAt: string;
    updatedAt: string;
}

export interface IUserData {
    id: number;
    username: string;
    socketToken: string;
    imageUrl: string;
    rights: number;
    notificationsSettings: number;
    email: string;
    dailyChoice: IRestaurant["id"] | null;
    notifications: INotification[];
    skin: string | null;
    theme: ITheme | null;
    officeId: number | null;
}
