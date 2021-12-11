import test from 'japa'
import { validateInputType } from './validateInputType'

test('validateInputType', (assert) => {
    assert.deepEqual(validateInputType('', 'string'), { error: false, msg: undefined })
    assert.deepEqual(validateInputType(true, 'string'), {
        error: true,
        msg: 'validateInputType error: expected string but got boolean',
    })
})
