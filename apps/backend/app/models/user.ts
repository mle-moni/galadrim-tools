import { ATTACHMENT_COLUMN } from "#services/attachment";
import { formatDateToNumber } from "#services/date";
import env from "#start/env";
import { DbAccessTokensProvider } from "@adonisjs/auth/access_tokens";
import { withAuthFinder } from "@adonisjs/auth/mixins/lucid";
import { DbRememberMeTokensProvider } from "@adonisjs/auth/session";
import { compose, cuid } from "@adonisjs/core/helpers";
import hash from "@adonisjs/core/services/hash";
import { BaseModel, beforeFind, belongsTo, column, hasMany } from "@adonisjs/lucid/orm";
import type { ModelQueryBuilderContract } from "@adonisjs/lucid/types/model";
import type { BelongsTo, HasMany } from "@adonisjs/lucid/types/relations";
import {
    type AllRights,
    type IImage,
    type INotification,
    type ITheme,
    type IUserData,
    hasRights,
    hasSomeRights,
} from "@galadrim-tools/shared";
import type { DateTime } from "luxon";
import Notification from "./notification.js";
import RestaurantChoice from "./restaurant_choice.js";
import RestaurantNote from "./restaurant_note.js";
import Theme from "./theme.js";

const AuthFinder = withAuthFinder(() => hash.use("argon"), {
    uids: ["username", "email"],
    passwordColumnName: "password",
});

export default class User extends compose(BaseModel, AuthFinder) {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare username: string;

    @column({ serializeAs: null })
    declare password: string;

    @column()
    declare email: string;

    @column()
    declare imageUrl: string;

    @column()
    declare otpToken: string | null;

    @column()
    declare rememberMeToken: string | null;

    @column()
    declare socketToken: string;

    @column()
    declare rights: number;

    @column()
    declare notificationsSettings: number;

    @column()
    declare skin: string | null;

    @column()
    declare themeId: number | null;

    @column(ATTACHMENT_COLUMN)
    declare image: IImage | null;

    @belongsTo(() => Theme)
    declare theme: BelongsTo<typeof Theme>;

    @hasMany(() => RestaurantChoice)
    declare choices: HasMany<typeof RestaurantChoice>;

    @hasMany(() => RestaurantNote)
    declare notes: HasMany<typeof RestaurantNote>;

    @hasMany(() => Notification)
    declare notifications: HasMany<typeof Notification>;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    @beforeFind()
    static autoLoadParametersFind(query: ModelQueryBuilderContract<typeof User>) {
        query.preload("choices");
    }

    get imageSrc() {
        if (this.image) {
            const backendUrl = env.get("BACKEND_URL");
            const joinedPath = new URL(this.image.url, backendUrl).toString();
            return joinedPath;
        }
        return this.imageUrl;
    }

    get shortData() {
        return {
            id: this.id,
            username: this.username,
            imageUrl: this.imageSrc,
        };
    }

    static getPersonalSocketFromId(id: number) {
        return `user-${id}`;
    }

    get personalSocket() {
        return User.getPersonalSocketFromId(this.id);
    }

    get dailyChoice() {
        return (
            this.choices.find((choice) => choice.day === formatDateToNumber(new Date()))
                ?.restaurantId ?? null
        );
    }

    userData(): IUserData {
        this.socketToken = cuid();
        this.save();

        const notifications = this.notifications.sort(
            (a, b) => b.id - a.id,
        ) as unknown as INotification[];

        const theme = (this.theme?.toJSON() ?? null) as ITheme | null;

        return {
            id: this.id,
            username: this.username,
            socketToken: this.socketToken,
            imageUrl: this.imageSrc,
            rights: this.rights,
            notificationsSettings: this.notificationsSettings,
            email: this.email,
            dailyChoice: this.dailyChoice,
            notifications,
            skin: this.skin,
            theme,
        };
    }

    hasRights(rightsWanted: AllRights[]) {
        return hasRights(this.rights, rightsWanted);
    }

    hasSomeRights(rightsWanted: AllRights[]) {
        return hasSomeRights(this.rights, rightsWanted);
    }

    getRightsData() {
        return { id: this.id, username: this.username, rights: this.rights };
    }

    static accessTokens = DbAccessTokensProvider.forModel(User);
    static rememberMeTokens = DbRememberMeTokensProvider.forModel(User);
}
