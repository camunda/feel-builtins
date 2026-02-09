import dts from 'rollup-plugin-dts';

export default {
  input: './dist/src/index.d.ts',
  output: {
    file: './dist/index.d.ts',
    format: 'es',
  },
  external: [ /^\.\.\/types\// ],
  plugins: [ dts() ],
};
