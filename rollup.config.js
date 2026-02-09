import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const srcEntry = './src/index.js';

export default {
  input: srcEntry,
  output: [
    { file: pkg.exports['.'].require, format: 'cjs' },
    { file: pkg.exports['.'].import, format: 'es' },
  ],
  plugins: [],
};
