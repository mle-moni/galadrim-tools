import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import fetch from 'got'

const fetchGaladrimeurs = async () => {
    const res = await fetch('https://forest.galadrim.fr/login')
    return res.body
}

const filterRawData = (rawHtml: string) => {
    const match = rawHtml.match(/label="Galadrimeurs.*\<\/optgroup/)
    if (!match) return []
    const htmlSlice = match[0].slice('label="Galadrimeurs">'.length)
    const options = htmlSlice.split('</optgroup>')[0]
    const galadrimeurs = options.split(/<option value="\d*">/)
    return galadrimeurs.map((galadrimeur) => galadrimeur.split('</option>')[0]).slice(1)
}

export const indexRoute = async (_params: HttpContextContract) => {
    const rawHtml = await fetchGaladrimeurs()
    return filterRawData(rawHtml)
}
