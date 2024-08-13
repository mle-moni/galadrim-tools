import { makeAutoObservable } from "mobx";

export class SimpleModalStore {
    modalOpen = false;

    constructor(modalOpen = false) {
        makeAutoObservable(this);
        this.modalOpen = modalOpen;
    }

    setModalOpen(state: boolean) {
        this.modalOpen = state;
    }
}
