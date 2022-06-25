import { makeAutoObservable } from 'mobx'

export class SaveurStore {
    constructor() {
        makeAutoObservable(this)
    }
}
