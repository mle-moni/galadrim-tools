import Notification from "#models/notification";
import User from "#models/user";
import { BaseSeeder } from "@adonisjs/lucid/seeders";
import { faker } from "@faker-js/faker";

function buildIdeasLink() {
    const maybeIdeaId = faker.helpers.maybe(() => faker.number.int({ min: 1, max: 50 }), {
        probability: 0.7,
    });

    if (!maybeIdeaId) return "/ideas";
    return `/ideas?ideaId=${maybeIdeaId}`;
}

function buildSaveurLink() {
    const restaurantId = faker.number.int({ min: 1, max: 80 });
    const zoom = faker.number.int({ min: 14, max: 18 });

    return `/saveur?zoom=${zoom}&restaurant-id=${restaurantId}`;
}

function buildPlannerLink() {
    const officeId = faker.helpers.arrayElement([1, 2, 4]);
    const floorId = faker.number.int({ min: 1, max: 8 });
    const roomId = faker.number.int({ min: 1, max: 300 });

    return `/planning?officeId=${officeId}&floorId=${floorId}&roomId=${roomId}`;
}

const TEMPLATES = [
    () => ({
        title: "Nouveau restaurant",
        text: faker.helpers.arrayElement([
            "Un nouveau restaurant vient d'être ajouté.",
            "Une nouvelle adresse à tester.",
            "Nouveau spot détecté.",
        ]),
        link: buildSaveurLink(),
        read: false,
    }),
    () => ({
        title: "Nouvelle idée",
        text: faker.helpers.arrayElement([
            "Une idée vient d'être ajoutée à la boîte.",
            "Une nouvelle idée est arrivée.",
            "Ça brainstorme fort aujourd'hui.",
        ]),
        link: "/ideas",
        read: false,
    }),
    () => ({
        title: "Nouveau commentaire",
        text: faker.helpers.arrayElement([
            "Quelqu'un a commenté une idée.",
            "Nouveau commentaire dans la boîte à idées.",
            "Discussion en cours sur une idée.",
        ]),
        link: buildIdeasLink(),
        read: faker.datatype.boolean(),
    }),
    () => ({
        title: "Rappel planning",
        text: faker.helpers.arrayElement([
            "Vous avez une réunion bientôt.",
            "Petit rappel sur votre planning.",
        ]),
        link: buildPlannerLink(),
        read: faker.datatype.boolean(),
    }),
    () => ({
        title: "Message admin",
        text: faker.helpers.arrayElement([
            "Mise à jour des outils en cours.",
            "Petit message d'information.",
            "Maintenance prévue dans la journée.",
        ]),
        link: null,
        read: true,
    }),
];

export default class NotificationSeeder extends BaseSeeder {
    public static environment = ["development"];

    public async run() {
        await Notification.query().delete();

        const users = await User.query().select(["id"]);
        if (users.length === 0) return;

        const notifications: Array<
            Pick<Notification, "userId" | "title" | "text" | "link" | "read">
        > = [];

        for (let index = 0; index < users.length; index++) {
            const user = users[index];

            const count = index === 0 ? 30 : index === 1 ? 10 : 3;

            for (let i = 0; i < count; i++) {
                const template = faker.helpers.arrayElement(TEMPLATES);
                const { link, read, text, title } = template();

                notifications.push({
                    userId: user.id,
                    title,
                    text,
                    link,
                    read,
                });
            }
        }

        await Notification.createMany(notifications);
    }
}
