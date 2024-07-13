import { HttpContext } from '@adonisjs/core/http'
import { getValidationSchemaFromConfig } from '#app/Adomin/routes/getValidationSchemaFromLucidModel'
import { loadFilesForInstances } from '#app/Adomin/routes/handleFiles'
import { validateOrThrow } from '#app/Adomin/validation/adominValidationHelpers'
import { getGenericMessages } from '#app/Adomin/validation/validationMessages'
import { computeRightsCheck } from '../../adominRoutesOverridesAndRights.js'
import { getModelData } from '../getModelData.js'
import { getValidatedModelConfig } from '../validateModelName.js'
import { attachFieldsToModel } from './attachFieldsToModel.js'

export const createModel = async (ctx: HttpContext) => {
    const { params, response, request } = ctx
    const modelConfig = await getValidatedModelConfig(params)

    if (modelConfig.staticRights?.create === false) {
        return response.badRequest({ error: `Impossible de créer un ${modelConfig.label}` })
    }

    const visibilityCheck = await computeRightsCheck(ctx, modelConfig.visibilityCheck)
    if (visibilityCheck === 'STOP') return
    const accesResult = await computeRightsCheck(ctx, modelConfig.crudlRights?.create)
    if (accesResult === 'STOP') return

    const override = modelConfig.routesOverrides?.create
    if (override) return override(ctx)

    const Model = modelConfig.model()

    if (modelConfig.validation) {
        const res = await validateOrThrow(ctx, modelConfig.validation, 'create')
        if (res !== true) return
    }

    const fields = modelConfig.fields

    const schema = getValidationSchemaFromConfig(modelConfig, 'create')
    const data = await request.validate({ schema, messages: getGenericMessages(Model) })

    const createdInstance = new Model()

    await attachFieldsToModel(createdInstance, fields, data)

    await createdInstance.save()

    const modelInstance = await getModelData(Model, createdInstance[Model.primaryKey])

    await loadFilesForInstances(fields, [modelInstance])

    return { message: 'Success', model: modelInstance }
}
