import { makeAutoObservable } from 'mobx'

export class SimpleModalStore {
    modalOpen = false

    constructor() {
        makeAutoObservable(this)
    }

    setModalOpen(state: boolean) {
        this.modalOpen = state
    }
}
