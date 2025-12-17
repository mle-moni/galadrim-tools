import { type IRestaurant, _assert } from "@galadrim-tools/shared";
import type L from "leaflet";
import { makeAutoObservable } from "mobx";
import { RestaurantsStore } from "./RestaurantsStore";
import { TagsStore } from "./TagsStore";

export const MAX_ZOOM = 18;
export class SaveurStore {
    private _leafletMap?: L.Map = undefined;

    leftMenuIsOpen = false;

    isReady = false;

    restaurantsStore = new RestaurantsStore();
    tagsStore = new TagsStore();

    constructor() {
        makeAutoObservable(this);
        this.init();
    }

    async init() {
        await this.restaurantsStore.fetch();
        await this.tagsStore.fetch();
        this.setIsReady(true);
    }

    setIsReady(state: boolean) {
        this.isReady = state;
    }

    setLeftMenuIsOpen(state: boolean) {
        this.leftMenuIsOpen = state;
    }

    toggeleftMenu() {
        this.setLeftMenuIsOpen(!this.leftMenuIsOpen);
    }

    initLeafletMap(leafletMap: L.Map) {
        this._leafletMap = leafletMap;
    }

    get leafletMap() {
        _assert(this._leafletMap, "you must initLeafletMap before using leafletMap");
        return this._leafletMap;
    }

    flyToRestaurantId(restaurantId: IRestaurant["id"], zoom = MAX_ZOOM) {
        const matchingRestaurant = this.restaurantsStore.getRestaurant(restaurantId);
        if (matchingRestaurant) {
            this.flyToRestaurant(matchingRestaurant, zoom);
        }
    }

    flyToRestaurant(restaurant: IRestaurant, zoom = MAX_ZOOM) {
        const { lat, lng } = restaurant;
        this.restaurantsStore.setRestaurantClicked(restaurant);
        this.leafletMap.flyTo({ lat, lng }, zoom);
    }
}
