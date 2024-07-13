import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Theme from '#app/Models/Theme'

const colorRegex = /^#[0-9a-f]{6}$/i

const updateThemeSchema = schema.create({
    name: schema.string([rules.trim()]),
    myEventsBg: schema.string([rules.trim(), rules.regex(colorRegex)]),
    myEventsBorder: schema.string([rules.trim(), rules.regex(colorRegex)]),
    myEventsText: schema.string([rules.trim(), rules.regex(colorRegex)]),
    otherEventsBg: schema.string([rules.trim(), rules.regex(colorRegex)]),
    otherEventsBorder: schema.string([rules.trim(), rules.regex(colorRegex)]),
    otherEventsText: schema.string([rules.trim(), rules.regex(colorRegex)]),
})

export const updateThemeRoute = async ({ request, auth }: HttpContextContract) => {
    const user = auth.user!
    const newTheme = await request.validate({
        schema: updateThemeSchema,
    })

    if (user.theme) {
        await user.theme.delete()
    }

    const themeCreated = await Theme.create(newTheme)

    user.themeId = themeCreated.id

    await user.save()

    return { theme: themeCreated }
}
