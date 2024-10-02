import { createFolderViewConfig } from "#adomin/create_folder_view_config";
import { createModelViewConfig } from "#adomin/create_model_view_config";
import Office from "#models/office";
import OfficeFloor from "#models/office_floor";
import OfficeRoom from "#models/office_room";

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
    },
});

const OFFICE_ROOMS_VIEW = createModelViewConfig(() => OfficeRoom, {
    label: "Salles",
    icon: "calendar-stats",
    columns: {
        name: {
            type: "string",
            label: "Nom",
        },
        // TODO remove this hack (e.g. by using a JSON column type)
        config: {
            type: "file",
            subType: "custom",
            createFile: async () => {},
            deleteFile: async () => {},
        },
        officeFloor: {
            type: "belongsToRelation",
            label: "Etage",
            labelFields: ["computedName"],
            modelName: "OfficeFloor",
            filterable: false,
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
    queryBuilderCallback: (q) => {
        q.preload("officeFloor", (q) => q.preload("office"));
    },
});

export const ROOMS_VIEWS = createFolderViewConfig({
    label: "Salles de réunion",
    icon: "building-community",
    name: "rooms-folder",
    views: [OFFICE_VIEW, FLOORS_VIEW, OFFICE_ROOMS_VIEW],
});
