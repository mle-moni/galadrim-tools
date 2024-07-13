import { HttpContext } from '@adonisjs/core/http'
import { ADOMIN_CONFIG } from '../config/ADOMIN_CONFIG.js'
import type { ModelConfig } from '../createModelViewConfig.js'
import { StatsViewConfig } from '../createStatsViewConfig.js'
import { computeRightsCheck } from './adominRoutesOverridesAndRights.js'

export const defaultFooterText = 'Made with ❤️ by Galadrim'

const getModelViewConfig = async (ctx: HttpContext, conf: ModelConfig) => {
    const { label, labelPluralized, name, isHidden, visibilityCheck } = conf

    const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck, false)

    return {
        type: 'model',
        label,
        labelPluralized,
        model: name,
        isHidden: isHidden ?? false,
        visibilityCheckPassed: visibilityCheckResult === 'OK',
    }
}

const getStatViewConfig = async (ctx: HttpContext, conf: StatsViewConfig) => {
    const { path, label, visibilityCheck, isHidden } = conf

    const visibilityCheckResult = await computeRightsCheck(ctx, visibilityCheck, false)

    return {
        type: 'stats',
        label,
        path,
        isHidden: isHidden ?? false,
        visibilityCheckPassed: visibilityCheckResult === 'OK',
    }
}

export const getAdominConfig = async (ctx: HttpContext) => {
    const { auth } = ctx
    const user = auth.user!
    const viewsPromises = ADOMIN_CONFIG.views.map(async (conf) => {
        if (conf.type === 'stats') {
            return getStatViewConfig(ctx, conf)
        }
        return getModelViewConfig(ctx, conf)
    })

    const viewsToFilter = await Promise.all(viewsPromises)
    const views = viewsToFilter.filter(({ visibilityCheckPassed }) => visibilityCheckPassed)

    const footerText = ADOMIN_CONFIG.footerText ?? defaultFooterText

    return {
        title: ADOMIN_CONFIG.title,
        footerText,
        views,
        userDisplayKey: ADOMIN_CONFIG.userDisplayKey ?? 'email',
        user,
    }
}
