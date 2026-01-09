import L from "leaflet";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

let didSetup = false;

export function setupLeafletDefaultIcons() {
    if (didSetup) return;
    didSetup = true;

    // Fix broken default marker icons under Vite.
    // Leaflet defaults to relative image paths which don't resolve.
    L.Icon.Default.prototype.options.iconRetinaUrl = iconRetinaUrl;
    L.Icon.Default.prototype.options.iconUrl = iconUrl;
    L.Icon.Default.prototype.options.shadowUrl = shadowUrl;
}
