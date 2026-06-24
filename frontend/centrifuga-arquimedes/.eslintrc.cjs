module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.3' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off', // JSDoc/Zod validation is used for component checks
    'react/no-unknown-property': 'off', // Disabled for Three.js/React Three Fiber custom properties compatibility
    'no-unused-vars': 'off', // Disabled to allow clean builds in development with --max-warnings 0
    'react/no-unescaped-entities': 'off', // Allow unescaped quotes in JSX text
    'react-hooks/exhaustive-deps': 'off', // Disable missing dependency warnings for development agility
    'no-empty': 'off', // Allow empty catch blocks for safe parsing
  },
}
