import { makeAutoObservable } from "mobx";
import { fetchBackendJson, getErrorMessage } from "../../api/fetch";
import { LoadingStateStore } from "../../reusableComponents/form/LoadingStateStore";
import { TextFieldStore } from "../../reusableComponents/form/TextFieldStore";
import { notifyError, notifySuccess } from "../../utils/notification";
import { BonneNouvelleRooms } from "../../utils/rooms";
import { APPLICATION_JSON_HEADERS } from "../idea/createIdea/CreateIdeaStore";

const NETWORK_NAMES = ["WIFI Orbi20", "WIFI 5G (meteor)", "WIFI SFR_3A8F", "ETHERNET"];
const ROOMS = [
    ...BonneNouvelleRooms.map(({ name }) => name),
    "Salle Business",
    "Salle Designer",
    "Grande Salle",
    "Salle du fond",
    "Salle des boss",
];

export class WifiStore {
    networkName: string | null = null;
    room: string | null = null;
    details = new TextFieldStore();

    constructor() {
        makeAutoObservable(this);
    }

    loadingState = new LoadingStateStore();

    async publish() {
        const body = JSON.stringify({
            networkName: this.networkName,
            room: this.room,
            details: this.details.text || null,
        });
        this.loadingState.setIsLoading(true);
        const res = await fetchBackendJson("/bugConnexions", "POST", {
            body,
            headers: APPLICATION_JSON_HEADERS,
        });
        this.loadingState.setIsLoading(false);

        if (!res.ok) {
            notifyError(getErrorMessage(res.json, "Erreur lors de la publication du bug de connexion"));
            return;
        }

        this.reset();
        notifySuccess("Bug de connexion publié avec succès");
    }

    reset() {
        this.networkName = null;
        this.room = null;
        this.details.setText("");
    }

    get canPublish() {
        return this.loadingState.isLoading === false && this.networkName && this.room;
    }

    get networkNameOptions() {
        return NETWORK_NAMES.map((name) => ({ value: name, label: name }));
    }

    setNetworkName(value: string) {
        this.networkName = value;
    }

    get roomOptions() {
        return ROOMS.map((name) => ({ value: name, label: name }));
    }

    setRoom(value: string) {
        this.room = value;
    }
}
