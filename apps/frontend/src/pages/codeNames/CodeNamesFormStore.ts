import { makeAutoObservable } from "mobx";
import { fetchBackendJson, getErrorMessage } from "../../api/fetch";
import { AppStore } from "../../globalStores/AppStore";
import { ImageInputStore } from "../../reusableComponents/form/ImageInputStore";
import { TextFieldStore } from "../../reusableComponents/form/TextFieldStore";
import { notifyError, notifySuccess } from "../../utils/notification";

export class CodeNamesFormStore {
    redSpyMaster: number | null = null;
    blueSpyMaster: number | null = null;
    roundSpyMaster: number | null = null;

    imageStore = new ImageInputStore();

    announce = new TextFieldStore();
    clueWord = new TextFieldStore();
    clueNumber = new TextFieldStore();

    constructor() {
        makeAutoObservable(this);
    }

    get roundSpyMasterOption() {
        if (!this.roundSpyMaster) return null;
        const user = AppStore.users.get(this.roundSpyMaster) ?? null;
        if (!user) return null;
        return { label: user.username, value: user.id };
    }

    get blueSpyMasterOption() {
        if (!this.blueSpyMaster) return null;
        const user = AppStore.users.get(this.blueSpyMaster) ?? null;
        if (!user) return null;
        return { label: user.username, value: user.id };
    }

    get redSpyMasterOption() {
        if (!this.redSpyMaster) return null;
        const user = AppStore.users.get(this.redSpyMaster);
        if (!user) return null;
        return { label: user.username, value: user.id };
    }

    setRedSpyMaster(newValue: number | null) {
        this.redSpyMaster = newValue;
    }

    setBlueSpyMaster(newValue: number | null) {
        this.blueSpyMaster = newValue;
    }

    setRoundSpyMaster(newValue: number | null) {
        this.roundSpyMaster = newValue;
    }

    get gameSpyMasterOptions() {
        return AppStore.userOptions.filter(
            ({ value }) => value === this.blueSpyMaster || value === this.redSpyMaster,
        );
    }

    getPayload() {
        const data = new FormData();

        if (!this.redSpyMaster || !this.blueSpyMaster) return;

        data.append("redSpyMasterId", this.redSpyMaster.toString());
        data.append("blueSpyMasterId", this.blueSpyMaster.toString());

        if (this.imageStore.image) {
            data.append("image", this.imageStore.image);
        }

        return data;
    }

    async submitNewGame() {
        const data = this.getPayload();

        const res = await fetchBackendJson<{ game: { id: number } }, unknown>(
            "/codeNamesGames",
            "POST",
            {
                body: data,
            },
        );

        if (res.ok) {
            notifySuccess("Une nouvelle partie a été créée !");
            location.replace(`/codeNamesGame/${res.json.game.id}`);
        } else {
            notifyError(getErrorMessage(res.json, "Impossible de créer la partie, bizarre"));
        }
    }

    getRoundPayload() {
        const data = new FormData();

        if (!this.roundSpyMaster) return;

        data.append("spyMasterId", this.roundSpyMaster.toString());

        data.append("announce", this.announce.text);
        data.append("clueWord", this.clueWord.text);
        data.append("clueNumber", this.clueNumber.text);

        return data;
    }
}
