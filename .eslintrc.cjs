module.exports = {
  root: true,
  env: { node: true, es2020: true },
  extends: [
    'eslint:recommended',
  ],
  ignorePatterns: ['node_modules', 'dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '20.10.0' } },
  rules: {
    'no-unused-vars': 'off',
    "semi": [2, "always"],
  },
}
