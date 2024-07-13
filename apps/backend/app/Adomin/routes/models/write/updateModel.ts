import { HttpContext } from '@adonisjs/core/http'
import { getValidationSchemaFromConfig } from '#app/Adomin/routes/getValidationSchemaFromLucidModel'
import { loadFilesForInstances } from '#app/Adomin/routes/handleFiles'
import { validateOrThrow } from '#app/Adomin/validation/adominValidationHelpers'
import { getGenericMessages } from '#app/Adomin/validation/validationMessages'
import { computeRightsCheck } from '../../adominRoutesOverridesAndRights.js'
import { validateResourceId } from '../../validateResourceId.js'
import { getModelData } from '../getModelData.js'
import { getValidatedModelConfig } from '../validateModelName.js'
import { attachFieldsToModel } from './attachFieldsToModel.js'

export const updateModel = async (ctx: HttpContext) => {
    const { params, response, request } = ctx
    const { id } = await validateResourceId(params)
    const modelConfig = await getValidatedModelConfig(params)

    if (modelConfig.staticRights?.update === false) {
        return response.badRequest({ error: 'Ce modèle ne peut pas être mis à jour' })
    }

    const visibilityCheck = await computeRightsCheck(ctx, modelConfig.visibilityCheck)
    if (visibilityCheck === 'STOP') return
    const accesResult = await computeRightsCheck(ctx, modelConfig.crudlRights?.update)
    if (accesResult === 'STOP') return

    const override = modelConfig.routesOverrides?.update
    if (override) return override(ctx)

    const Model = modelConfig.model()

    if (modelConfig.validation) {
        const res = await validateOrThrow(ctx, modelConfig.validation, 'update')
        if (res !== true) return
    }

    const schema = getValidationSchemaFromConfig(modelConfig, 'update')
    const parsedData = await request.validate({ schema, messages: getGenericMessages(Model) })
    const fields = modelConfig.fields

    const modelInstance = await getModelData(Model, id)

    await attachFieldsToModel(modelInstance, fields, parsedData)

    await modelInstance.save()

    await loadFilesForInstances(fields, [modelInstance])

    return { message: 'Success', model: modelInstance }
}
