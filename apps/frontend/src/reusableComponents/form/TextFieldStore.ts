import { makeAutoObservable } from "mobx";

export class TextFieldStore<T extends string = string> {
    text = "" as T;
    visited = false;

    constructor(private defaultValue?: T) {
        makeAutoObservable(this);
        if (defaultValue) {
            this.text = defaultValue;
        }
    }

    setText(state: T) {
        this.text = state;
    }

    setVisited(state: boolean) {
        this.visited = state;
    }

    onBlur() {
        this.setVisited(true);
    }

    reset() {
        this.setText(this.defaultValue ?? ("" as T));
    }
}
