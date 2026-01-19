import type { HttpContext } from "@adonisjs/core/http";
import type { ModelQueryBuilderContract } from "@adonisjs/lucid/types/model";
import vine from "@vinejs/vine";
import { createFolderViewConfig } from "#adomin/create_folder_view_config";
import { createModelViewConfig } from "#adomin/create_model_view_config";
import type {
    AdominRightsCheckConfig,
    AdominRightsCheckFunction,
} from "#adomin/routes/adomin_routes_overrides_and_rights";
import Office from "#models/office";
import OfficeFloor from "#models/office_floor";
import OfficeRoom from "#models/office_room";
import Sensor from "#models/sensor";

const checkIsRoomAdmin: AdominRightsCheckFunction = async (ctx: HttpContext) => {
    const user = ctx.auth.user;
    if (!user || !user.hasRights(["EVENT_ADMIN"]))
        return {
            hasAccess: false,
            errorMessage: "Vous n'avez pas les droits nécessaires pour accéder à cette ressource",
        };

    return {
        hasAccess: true,
    };
};

const RIGHT_CHECKS: AdominRightsCheckConfig = {
    create: checkIsRoomAdmin,
    update: checkIsRoomAdmin,
    delete: checkIsRoomAdmin,
};

const OFFICE_VIEW = createModelViewConfig(() => Office, {
    label: "Bureaux",
    icon: "building",
    columns: {
        name: {
            type: "string",
            label: "Nom",
        },
        address: {
            type: "string",
            label: "Adresse",
        },
        lat: {
            type: "number",
            label: "Latitude",
            defaultValue: 48.85364330135058,
        },
        lng: {
            type: "number",
            label: "Longitude",
            defaultValue: 2.36431360244751,
        },
        createdAt: {
            type: "date",
            label: "Créé le",
            subType: "datetime",
            creatable: false,
            editable: false,
        },
        updatedAt: {
            type: "date",
            label: "Mis à jour le",
            subType: "datetime",
            creatable: false,
            editable: false,
        },
    },
    crudlRights: RIGHT_CHECKS,
});

const FLOORS_VIEW = createModelViewConfig(() => OfficeFloor, {
    label: "Etage",
    icon: "elevator",
    columns: {
        office: {
            type: "belongsToRelation",
            label: "Bureau",
            labelFields: ["name"],
            modelName: "Office",
        },
        floor: {
            type: "number",
            label: "Etage",
        },
        createdAt: {
            type: "date",
            label: "Créé le",
            subType: "datetime",
            creatable: false,
            editable: false,
        },
        updatedAt: {
            type: "date",
            label: "Mis à jour le",
            subType: "datetime",
            creatable: false,
            editable: false,
        },
        computedName: {
            type: "string",
            computed: true,
            creatable: false,
            editable: false,
            sqlFilter: (search, builder: ModelQueryBuilderContract<typeof OfficeFloor>) => {
                if (!search) return;
                const lowerSearch = search.toLowerCase();
                if (lowerSearch.startsWith("etage ")) {
                    const floor = lowerSearch.replace("etage ", "");
                    if (floor.length === 0) return;
                    builder.where("floor", floor);
                    return;
                }
                const parts = lowerSearch.split(" - etage ");
                builder.where((subquery) => {
                    subquery.whereHas("office", (q) => q.whereILike("name", parts[0]));
                    if (parts.length === 2) subquery.andWhere("floor", parts[1]);
                });
            },
        },
    },
    crudlRights: RIGHT_CHECKS,
});

const roomConfigValidation = vine.compile(
    vine.object({
        points: vine.array(
            vine.object({
                x: vine.number(),
                y: vine.number(),
            }),
        ),
    }),
);

const OFFICE_ROOMS_VIEW = createModelViewConfig(() => OfficeRoom, {
    label: "Salles",
    icon: "calendar-stats",
    columns: {
        name: {
            type: "string",
            label: "Nom",
        },
        config: {
            type: "json",
            validation: roomConfigValidation,
        },
        isBookable: {
            type: "boolean",
            defaultValue: true,
        },
        isPhonebox: {
            type: "boolean",
            defaultValue: false,
        },
        hasTv: {
            type: "boolean",
            label: "TV",
            defaultValue: false,
        },
        officeFloor: {
            type: "belongsToRelation",
            label: "Etage",
            labelFields: ["computedName"],
            modelName: "OfficeFloor",
        },
        createdAt: {
            type: "date",
            label: "Créé le",
            subType: "datetime",
            creatable: false,
            editable: false,
        },
        updatedAt: {
            type: "date",
            label: "Mis à jour le",
            subType: "datetime",
            creatable: false,
            editable: false,
        },
    },
    virtualColumns: [
        {
            name: "offices",
            adomin: {
                type: "belongsToRelation",
                label: "Bureau",
                modelName: "Office",
                labelFields: ["name"],
                filterable: true,
                sqlFilter: (search, builder: ModelQueryBuilderContract<typeof OfficeRoom>) => {
                    if (!search) return;
                    builder.whereHas("officeFloor", (q) => q.where("office_id", search));
                },
            },
            async getter(model) {
                return model.officeFloor.office;
            },
            columnOrderIndex: 3,
        },
    ],
    queryBuilderCallback: (q) => {
        q.preload("officeFloor", (q) => q.preload("office"));
    },
    crudlRights: RIGHT_CHECKS,
});

const SENSORS_VIEW = createModelViewConfig(() => Sensor, {
    label: "Capteurs",
    icon: "wifi",
    columns: {
        name: {
            type: "string",
            label: "Nom",
        },
        sensorId: {
            type: "string",
            label: "ID du capteur",
        },
        officeRoom: {
            type: "belongsToRelation",
            label: "Salle",
            labelFields: ["name"],
            modelName: "OfficeRoom",
        },
        lastBat: {
            type: "number",
            label: "Batterie",
            editable: false,
            creatable: false,
        },
        lastLux: {
            type: "number",
            label: "Luminosité (lux)",
            editable: false,
            creatable: false,
        },
        lastTemp: {
            type: "number",
            label: "Température (°C)",
            editable: false,
            creatable: false,
        },
        createdAt: {
            type: "date",
            label: "Créé le",
            subType: "datetime",
            creatable: false,
            editable: false,
        },
        updatedAt: {
            type: "date",
            label: "Mis à jour le",
            subType: "datetime",
            creatable: false,
            editable: false,
        },
    },
    crudlRights: RIGHT_CHECKS,
});

export const ROOMS_FOLDER = createFolderViewConfig({
    label: "Salles de réunion",
    icon: "building-community",
    name: "rooms-folder",
    views: [OFFICE_VIEW, FLOORS_VIEW, OFFICE_ROOMS_VIEW, SENSORS_VIEW],
});
