const FAVOURITE_LOCAUX_KEY = 'FAVOURITE_LOCAUX'

export const getFavouriteLocauxIndex = (defaultIndex = 0) => {
    const favouriteLocauxIndexString = localStorage.getItem(FAVOURITE_LOCAUX_KEY)

    const favouriteLocauxIndex = +(favouriteLocauxIndexString ?? defaultIndex)

    if (isNaN(favouriteLocauxIndex)) {
        return defaultIndex
    }

    return favouriteLocauxIndex
}

export const setFavouriteLocauxIndex = (index: number) => {
    localStorage.setItem(FAVOURITE_LOCAUX_KEY, index.toString())
}
