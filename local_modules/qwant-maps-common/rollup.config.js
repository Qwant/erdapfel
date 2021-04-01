import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'index.js',
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [commonjs(), json({ namedExports: false }), dynamicImportVars()],
};
