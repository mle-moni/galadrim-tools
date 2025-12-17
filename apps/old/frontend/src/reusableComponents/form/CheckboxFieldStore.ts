import { makeAutoObservable } from "mobx";

export class CheckboxFieldStore<T extends boolean = boolean> {
    checked = false as T;

    constructor(private defaultValue: T = false as T) {
        makeAutoObservable(this);
        if (defaultValue) {
            this.checked = defaultValue;
        }
    }

    setChecked(state: T) {
        this.checked = state;
    }

    reset() {
        this.setChecked(this.defaultValue ?? (false as T));
    }
}
