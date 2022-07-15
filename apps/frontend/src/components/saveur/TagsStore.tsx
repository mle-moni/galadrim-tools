import { ITag } from "@galadrim-rooms/shared";
import { makeAutoObservable } from "mobx";
import { fetchBackendJson } from "../../api/fetch";
import { notifyError } from "../../utils/notification";

export class TagsStore {
    tags: ITag[] = []

    constructor() {
        makeAutoObservable(this)
    }

    setTags(tags: ITag[]) {
        this.tags = tags
    }

    async fetch() {

        const req = await fetchBackendJson<ITag[], unknown>('/tags')
        if (req.ok) {
            this.setTags(req.json)
            return
        }
        notifyError('Impossible de récupérer les tags')
    }
}