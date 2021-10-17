export const getApiUrl = () => {
    const url = import.meta.env.VITE_API_URL
    if (typeof url !== 'string') throw new Error(`VITE_API_URL should be a valid string`)
    return url
}
