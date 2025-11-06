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
    "valid-jsdoc": "off",
    camelcase: "error",
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
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 2020,
        project: "./tsconfig.json",
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "google",
        "prettier",
      ],
      plugins: ["@typescript-eslint", "prettier"],
      rules: {
        "no-restricted-globals": ["error", "name", "length"],
        "prefer-arrow-callback": "error",
        quotes: ["error", "double", {allowTemplateLiterals: true}],
        "new-cap": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "no-unused-vars": "off",
        "require-jsdoc": "off",
        "no-unsafe-optional-chaining": "warn",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "valid-jsdoc": "off",
        camelcase: "error",
        "@typescript-eslint/no-require-imports": "off",
      },
    },
  ],
  globals: {},
};
