var path = require('path');

module.exports = {
  "collectCoverage": true,
  "collectCoverageFrom": [
      "**/*.{ts}",
      "!**/*.{d.ts}",
      "!**/__tests__/**",
      "!**/node_modules/**"
  ],
  "verbose": true,
  "moduleDirectories": [
      "node_modules"
  ],
  "transform": {
      ".(ts|tsx)": "<rootDir>/node_modules/ts-jest/preprocessor.js"
  },
  "testRegex": "/__tests__/.*\\.spec\\.(ts)$",
  "testPathIgnorePatterns": [
      "/browser/"
  ],
  "moduleFileExtensions": [
      "ts",
      "js",
      "json"
  ],
  "globals": {
      "PRODUCTION": false
  },
  "rootDir": path.resolve(__dirname, '../../../')
};