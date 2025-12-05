module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  globals: {
    chrome: 'readonly'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error'
  }
};