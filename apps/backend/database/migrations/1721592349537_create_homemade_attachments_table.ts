import CodeNamesGame from "#models/code_names_game";
import Restaurant from "#models/restaurant";
import RestaurantReview from "#models/restaurant_review";
import User from "#models/user";
import { BaseSchema } from "@adonisjs/lucid/schema";
import type { IImage } from "@galadrim-tools/shared";

interface DtoCreationInput {
    id: number;
    image: Omit<IImage, "url"> | null;
}

interface Dto {
    id: number;
    image: IImage | null;
}

const createDto = (input: DtoCreationInput[]): Dto[] => {
    return input.map(({ id, image }) => {
        if (!image) {
            return { id, image: null };
        }

        return {
            id,
            image: {
                url: `/uploads/${image.name}`,
                name: image.name,
            },
        };
    });
};

export default class extends BaseSchema {
    async up() {
        const userImages = await User.query().select("id", "image").whereNotNull("image");
        await User.updateOrCreateMany("id", createDto(userImages));

        const restaurantImages = await Restaurant.query()
            .select("id", "image")
            .whereNotNull("image");
        await Restaurant.updateOrCreateMany("id", createDto(restaurantImages));

        const restaurantReviewImages = await RestaurantReview.query()
            .select("id", "image")
            .whereNotNull("image");
        await RestaurantReview.updateOrCreateMany("id", createDto(restaurantReviewImages));

        const codeNamesGameImages = await CodeNamesGame.query()
            .select("id", "image")
            .whereNotNull("image");
        await CodeNamesGame.updateOrCreateMany("id", createDto(codeNamesGameImages));
    }

    async down() {
        // flemme :)
    }
}
