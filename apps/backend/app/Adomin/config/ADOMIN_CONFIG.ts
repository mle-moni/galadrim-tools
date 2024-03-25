import { AdominConfig } from '../adominConfig'
import { createStatsViewConfig } from '../createStatsViewConfig'
import {
    groupByDayOfWeek,
    groupByHour,
    groupByMonth,
    groupByStringField,
    groupByYear,
} from '../routes/stats/groupByHelpers'

/**
 * This file will contain your Adomin Config
 * For each model you want to have in you backoffice, you will need to add in the "models" array,
 * with the following syntax:
 * createModelConfig(() => YourModel, {})
 */

export const ADOMIN_CONFIG: AdominConfig = {
    title: 'Adomin',
    views: [
        createStatsViewConfig({
            label: 'Réservations KPI',
            path: 'reservations',
            stats: [
                {
                    label: 'Reservations par jour',
                    name: 'eventsPerDay',
                    type: 'area',
                    dataFetcher: () => groupByDayOfWeek('events', 'created_at'),
                },
                {
                    label: 'Reservations par heures',
                    name: 'eventsPerHour',
                    type: 'line',
                    dataFetcher: () => groupByHour('events', 'created_at', { allHours: true }),
                },
                {
                    label: 'Reservations par mois',
                    name: 'eventsPerMonth',
                    type: 'column',
                    dataFetcher: () => groupByMonth('events', 'created_at'),
                },
                {
                    label: 'Reservations par année',
                    name: 'eventsPerYear',
                    type: 'pie',
                    dataFetcher: () => groupByYear('events', 'created_at'),
                },
            ],
        }),
        createStatsViewConfig({
            label: 'Utilisateurs KPI',
            path: 'users',
            stats: [
                {
                    label: "Création d'utilisateurs par jour",
                    name: 'usersPerDay',
                    type: 'column',
                    dataFetcher: () => groupByDayOfWeek('users', 'created_at'),
                },
                {
                    label: "Création d'utilisateurs par année",
                    name: 'usersPerYear',
                    type: 'pie',
                    dataFetcher: () => groupByYear('users', 'created_at'),
                },
            ],
        }),
        createStatsViewConfig({
            label: 'Idées KPI',
            path: 'ideas',
            stats: [
                {
                    label: "Création d'idées par jour",
                    name: 'ideasPerDay',
                    type: 'column',
                    dataFetcher: () => groupByDayOfWeek('ideas', 'created_at'),
                },
                {
                    label: "Création d'idées par année",
                    name: 'ideasPerYear',
                    type: 'pie',
                    dataFetcher: () => groupByYear('ideas', 'created_at'),
                },
                {
                    label: "Création d'idées par heures",
                    name: 'ideasPerHour',
                    type: 'line',
                    dataFetcher: () => groupByHour('ideas', 'created_at', { allHours: true }),
                },
                {
                    label: "Création d'idées par mois",
                    name: 'ideasPerMonth',
                    type: 'column',
                    dataFetcher: () => groupByMonth('ideas', 'created_at'),
                },
            ],
        }),
        createStatsViewConfig({
            label: 'Bug de connexions',
            path: 'bug-connexions',
            stats: [
                {
                    label: 'Bugs par heures',
                    name: 'bugsPerHour',
                    type: 'line',
                    dataFetcher: () =>
                        groupByHour('bug_connexions', 'created_at', { allHours: true }),
                },
                {
                    label: 'Bugs par salle',
                    name: 'bugsPerRoom',
                    type: 'pie',
                    dataFetcher: () => groupByStringField('bug_connexions', 'room'),
                },
                {
                    label: 'Bugs par connexion',
                    name: 'bugsPerNetworkName',
                    type: 'pie',
                    dataFetcher: () => groupByStringField('bug_connexions', 'network_name'),
                },
                {
                    label: 'Bugs par jour',
                    name: 'bugsPerDay',
                    type: 'column',
                    dataFetcher: () => groupByDayOfWeek('bug_connexions', 'created_at'),
                },
                {
                    label: 'Bugs par mois',
                    name: 'bugsPerMonth',
                    type: 'column',
                    dataFetcher: () => groupByMonth('bug_connexions', 'created_at'),
                },
                {
                    label: 'Bugs par année',
                    name: 'bugsPerYear',
                    type: 'pie',
                    dataFetcher: () => groupByYear('bug_connexions', 'created_at'),
                },
            ],
        }),
    ],
}
