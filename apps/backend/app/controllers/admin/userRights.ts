import User from "#models/user";

export const userRightsRoute = async () => {
    const users = await User.all();
    return users.map((user) => user.getRightsData());
};
