module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: ["eslint:recommended", "google", "prettier"],
  plugins: ["prettier"],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    quotes: ["error", "double", {allowTemplateLiterals: true}],
    "new-cap": "off",
    "no-unused-vars": "warn",
    "require-jsdoc": "off",
    "no-unsafe-optional-chaining": "warn",
  },
  overrides: [
    {
      files: ["**/*.spec.*", "**/*.test.*"],
      env: {
        mocha: true,
        jest: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
