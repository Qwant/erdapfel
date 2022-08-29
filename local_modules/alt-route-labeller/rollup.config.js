import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'index.js',
  output: {
    file: 'dist/altRouteLabeller.js',
    format: 'umd',
    name: 'altRouteLabeller',
    sourcemap: true,
  },
  plugins: [
    commonjs(),
    nodeResolve({ preferBuiltins: false }),
    babel({ babelHelpers: 'bundled' }),
    terser(),
  ],
};
