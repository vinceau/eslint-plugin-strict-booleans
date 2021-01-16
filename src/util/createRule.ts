import { ESLintUtils } from "@typescript-eslint/experimental-utils";

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// const version = require('../../package.json').version;

export const createRule = ESLintUtils.RuleCreator(() => `https://github.com/vinceau/no-nullable-numbers`);
