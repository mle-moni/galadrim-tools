import User from "#models/user";
import { BaseSeeder } from "@adonisjs/lucid/seeders";
import { faker } from "@faker-js/faker";
import { RIGHTS, generateRights } from "@galadrim-tools/shared";

export default class UserSeeder extends BaseSeeder {
    public static environment = ["development"];

    public async run() {
        await User.updateOrCreateMany("id", [
            {
                id: 1,
                username: "test",
                email: "test@test.fr",
                imageUrl: "https://forest.galadrim.fr/img/users/default.png",
                password: "test",
                rights: RIGHTS.DEFAULT,
            },
            {
                id: 2,
                username: "miam",
                email: "miam@miam.fr",
                imageUrl:
                    "https://static8.depositphotos.com/1010340/945/v/450/depositphotos_9459006-stock-illustration-chef-cartoon.jpg",
                password: "miam",
                rights: generateRights(["MIAM_ADMIN"]),
            },
            {
                id: 3,
                username: "admin",
                email: "admin@admin.fr",
                imageUrl: "https://forest.galadrim.fr/img/users/105.jpg",
                password: "admin",
                rights: generateRights([
                    "EVENT_ADMIN",
                    "MIAM_ADMIN",
                    "RIGHTS_ADMIN",
                    "USER_ADMIN",
                    "DASHBOARD_ADMIN",
                ]),
            },
            {
                id: 4,
                username: "peon",
                email: "peon@peon.fr",
                imageUrl: "https://forest.galadrim.fr/img/users/default.png",
                password: "peon",
                rights: RIGHTS.DEFAULT,
            },
        ]);

        const userDtos = [];
        for (let i = 1; i <= 100; i++) {
            userDtos.push({
                username: faker.internet.username(),
                email: faker.internet.email(),
                imageUrl: faker.image.url(),
                password: "test",
                rights: RIGHTS.DEFAULT,
            });
        }
        await User.createMany(userDtos);
    }
}
