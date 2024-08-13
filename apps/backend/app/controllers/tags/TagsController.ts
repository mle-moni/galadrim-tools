import type { HttpContext } from "@adonisjs/core/http";
import { destroyRoute } from "./destroyTag.js";
import { showRoute } from "./showTag.js";
import { storeRoute } from "./storeTag.js";
import { indexRoute } from "./tagsIndex.js";
import { updateRoute } from "./updateTag.js";

export default class TagsController {
    public async index(params: HttpContext) {
        return indexRoute(params);
    }

    public async store(params: HttpContext) {
        return storeRoute(params);
    }

    public async show(params: HttpContext) {
        return showRoute(params);
    }

    public async update(params: HttpContext) {
        return updateRoute(params);
    }

    public async destroy(params: HttpContext) {
        return destroyRoute(params);
    }
}
