import { _assert } from "@galadrim-tools/shared";
import { makeAutoObservable } from "mobx";
import { fetchBackendJson } from "../../../api/fetch";
import { APPLICATION_JSON_HEADERS } from "../../idea/createIdea/CreateIdeaStore";

export type GalakiGuess = {
    id: number;
    portraitGuessable: {
        pictureUrl: string;
        guess: string;
    };
};

export class GalakiStore {
    guesses: GalakiGuess[] | undefined;
    currentGuessIdx = 0;
    constructor() {
        makeAutoObservable(this);
    }

    async fetchGuesses() {
        const fetchResult = await fetchBackendJson<GalakiGuess[], unknown>(
            "/portraitGuessGame",
            "GET",
            {
                headers: APPLICATION_JSON_HEADERS,
            },
        );
        if (fetchResult.ok) {
            this.setGuesses(fetchResult.json);
        }
    }

    setGuesses(guesses: GalakiGuess[]) {
        this.guesses = guesses;
    }

    get fetchingGuess() {
        return this.guesses === undefined;
    }

    async setGuess(grade: 1 | 2 | 3 | 4) {
        _assert(this.currentGuess);
        const body = JSON.stringify({
            guessId: this.currentGuess.id,
            grade,
        });
        fetchBackendJson("/portraitGuessGame", "POST", {
            body,
            headers: APPLICATION_JSON_HEADERS,
        });
    }

    get currentGuess() {
        return this.guesses?.at(this.currentGuessIdx);
    }

    processNextGuess() {
        this.currentGuessIdx += 1;
    }
}
