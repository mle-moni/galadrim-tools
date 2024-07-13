import { HttpContext } from '@adonisjs/core/http'
import { schema, validator } from '@adonisjs/validator'
import { ADOMIN_CONFIG } from '#app/Adomin/config/ADOMIN_CONFIG'
import { getModelConfig } from './getModelConfig.js'

const isNotNull = <T>(value: T | null): value is T => value !== null

const modelsEnum = ADOMIN_CONFIG.views
    .map((conf) => {
        if (conf.type !== 'model') return null
        return conf.model().name
    })
    .filter(isNotNull)

const modelNameSchema = schema.create({ model: schema.enum(modelsEnum) })

export const validateModelName = (data: unknown) => {
    return validator.validate({ schema: modelNameSchema, data })
}

export const getValidatedModelConfig = async (params: HttpContext['params']) => {
    const { model } = await validateModelName(params)

    return getModelConfig(model)
}
