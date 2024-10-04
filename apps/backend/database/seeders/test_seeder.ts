import OfficeRoom from "#models/office_room";
import { BaseSeeder } from "@adonisjs/lucid/seeders";

const floorPlan = [
    {
        roomName: "Salle 1",
        config: {
            points: [
                { x: 1950, y: 1050 },
                { x: 1950, y: 540 },
                { x: 1836, y: 540 },
                { x: 1836, y: 640 },
                { x: 1739, y: 640 },
                { x: 1739, y: 1050 },
            ],
        },
    },
    {
        roomName: "Salle 2",
        config: {
            points: [
                { x: 1950, y: 530 },
                { x: 1950, y: 30 },
                { x: 1740, y: 30 },
                { x: 1740, y: 530 },
            ],
        },
    },
    {
        roomName: "Cusine",
        config: {
            points: [
                { x: 1727, y: 220 },
                { x: 1727, y: 40 },
                { x: 1510, y: 40 },
                { x: 1510, y: 220 },
            ],
        },
    },
    {
        roomName: "Toilettes",
        config: {
            points: [
                { x: 1500, y: 220 },
                { x: 1500, y: 40 },
                { x: 1300, y: 40 },
                { x: 1300, y: 220 },
            ],
        },
    },
    {
        roomName: "Salle 3",
        config: {
            points: [
                { x: 1720, y: 1046 },
                { x: 1720, y: 640 },
                { x: 1320, y: 640 },
                { x: 1320, y: 1046 },
            ],
        },
    },
];

export default class extends BaseSeeder {
    async run() {
        await OfficeRoom.query().where("officeFloorId", 4).delete();

        await OfficeRoom.createMany(
            floorPlan.map(({ config, roomName }) => ({
                name: roomName,
                config,
                officeFloorId: 4,
            })),
        );
    }
}
