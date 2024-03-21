module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    modulePaths: ['<rootDir>/'],
    testEnvironment: 'node',
    testRegex: ['.spec.ts$'],
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest'
    },
}