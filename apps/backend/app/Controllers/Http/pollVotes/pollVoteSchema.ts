import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'

export const pollVoteSchema = schema.create({
    pollOptionId: schema.number.optional([rules.exists({ table: 'poll_options', column: 'id' })]),
    optionType: schema.enum.optional(['date', 'text'] as const),
    optionText: schema.string.optional(),
    optionDate: schema.date.optional(),
})

const pollIdSchema = schema.create({ pollId: schema.number() })

export const validatePollId = (data: unknown) => {
    return validator.validate({ schema: pollIdSchema, data })
}
