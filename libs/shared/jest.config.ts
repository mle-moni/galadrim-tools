module.exports = {
    displayName: 'shared',
    preset: '../../jest.preset.ts',
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/libs/shared',
}
