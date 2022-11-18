function err(...args) {
    return ["error", ...args];
}

module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    overrides: [
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ["./tsconfig.json"]
    },
    plugins: ['@typescript-eslint'],
    rules: {
        "indent": err(4),
        "func-names": err("never"),
        "consistent-this": err("self"),
        "default-case-last": err(),
        "default-param-last": err(),
        "eqeqeq": err("always", {"null": "ignore"}),
        "no-delete-var": err(),
        "no-eval": err(),
        "no-implied-eval": err(),
        "no-lone-blocks": err(),
        "no-lonely-if": err(),
        "no-return-await": err(),
        "no-var": err(),
        "prefer-destructuring": err({"object": true}),
        "prefer-const": err(),
        "prefer-arrow-callback": err(),
        "prefer-rest-params": err(),
        "prefer-spread": err(),
        "prefer-template": err(),
        "require-await": err(),
        "require-yield": err(),
        "spaced-comment": err("always"),
        "comma-dangle": err("always-multiline"),
        "comma-style": err("last"),
        "comma-spacing": err(),
        "eol-last": err("always"),
        "dot-location": err("property"),
        "brace-style": err(),
        "function-paren-newline": err("consistent"),
        "function-call-argument-newline": err("consistent"),
        "block-scoped-var": err(),
        "consistent-return": err(),
        "no-async-promise-executor": err(),
        "no-promise-executor-return": err(),
        "semi": err("always"),
        "semi-style": err(),
        "space-unary-ops": err(),
        "space-infix-ops": err(),
        "space-before-blocks": err(),
        "operator-linebreak": err("before"),
        "@typescript-eslint/no-misused-promises": err(),
        "@typescript-eslint/no-floating-promises": err(),
        "@typescript-eslint/await-thenable": err(),
    }
}
