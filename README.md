# `strict-booleans`

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

Then enable the rule:

```json
{
  "rules": {
    "strict-booleans/no-nullable-numbers": "error"
  }
}
```
