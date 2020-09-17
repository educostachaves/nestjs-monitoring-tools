module.exports = {
  verbose: true,
  moduleFileExtensions: [
    "js",
    "json",
    "ts",
  ],
  testPathIgnorePatterns: ['<rootDir>/(build|config|node_modules)/'],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  resetMocks: false,
  rootDir: "src",
  testRegex: ".spec.ts$",
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  testResultsProcessor: 'jest-sonar-reporter',
  setupFilesAfterEnv: ["../test/config/jest.setup.js"],
};
