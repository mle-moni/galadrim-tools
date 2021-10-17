import { getApiUrl } from "./url";

export const fetchGaladrimeurs = async () => {
    const url = getApiUrl()
    const res = await fetch(`${url}/galadrimeurs`)
    return res.json()
}
