/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: ".",
  testRegex: ".*\\.test\\.ts$",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  }
};