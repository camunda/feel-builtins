import pkg from './package.json';

const srcEntry = './src/index.js';

export default [
  {
    input: srcEntry,
    output: [
      { file: pkg.exports['.'].require, format: 'cjs' },
      { file: pkg.exports['.'].import, format: 'es' }
    ]
  }
];