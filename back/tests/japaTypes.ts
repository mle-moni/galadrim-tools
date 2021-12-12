import test from 'japa'

export type Assert = Parameters<Parameters<typeof test>[1]>[0]
