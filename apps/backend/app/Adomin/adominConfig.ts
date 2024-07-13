import type { ModelConfig } from './createModelViewConfig.js'
import { StatsViewConfig } from './createStatsViewConfig.js'

export type AdominViewConfig = ModelConfig | StatsViewConfig

export interface AdominConfig {
    title: string
    /** The key of the user property to show to logged in administrators
     * @default 'email'
     */
    userDisplayKey?: string
    footerText?: string
    views: AdominViewConfig[]
}
