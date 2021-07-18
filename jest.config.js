/* eslint-env node */

const config = {
  preset: "ts-jest/presets/default",
  moduleFileExtensions: ["js", "json", "ts", "tsx"],
  testMatch: ["**/__tests__/**/*.spec.ts", "**/__tests__/**/*.spec.tsx", "**/__tests__/**/*.e2e-spec.ts"],
  transform: {
    // "^.+\\.(t|j)sx?$": "ts-jest",
    // TODO: both @swc/jest and @swc-node/jest gives invalid lineno when a test throws exception
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  testEnvironment: "node",
  collectCoverage: false,
  coverageDirectory: "../coverage",
};

module.exports = config;
