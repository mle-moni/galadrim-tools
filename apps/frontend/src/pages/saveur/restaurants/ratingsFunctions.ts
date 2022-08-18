import { UserData } from '../../../api/galadrimeurs'

export const getNameOfUsers = (userIds: number[], usersMap: Map<number, UserData>) => {
    const users = userIds
        .map((id) => usersMap.get(id)?.username)
        .filter((username) => username !== undefined)

    return users.join(', ')
}
