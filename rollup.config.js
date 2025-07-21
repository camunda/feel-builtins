import pkg from './package.json' with { type: 'json' };

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