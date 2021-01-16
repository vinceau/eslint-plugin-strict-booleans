# `strict-booleans`

[![npm version](https://img.shields.io/npm/v/eslint-plugin-strict-booleans.svg?style=flat)](https://npmjs.org/package/eslint-plugin-strict-booleans "View this project on npm")
[![Build Status](https://github.com/vinceau/eslint-plugin-strict-booleans/workflows/build/badge.svg)](https://github.com/vinceau/eslint-plugin-strict-booleans/actions?workflow=build)

Disallows nullable numbers to be used in boolean expressions. That's it.

Based on the [`@typescript-eslint/strict-boolean-expressions`](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/strict-boolean-expressions.md) rule.

## Installation

### With NPM

```
npm install --save-dev eslint eslint-plugin-strict-booleans
```

### With Yarn

```
yarn add -D eslint eslint-plugin-strict-booleans
```

## Usage

Add `strict-booleans` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["strict-booleans"]
}
```

You may also need to set `project` in the `parserOptions` section of your `.eslintrc`.

```json
{
  "parserOptions": {
    "project": "tsconfig.json"
  }
}
```

Then enable the rule:

```json
{
  "rules": {
    "strict-booleans/no-nullable-numbers": "error"
  }
}
```
