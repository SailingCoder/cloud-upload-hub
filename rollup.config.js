import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],
  external: ['ali-oss', 'cos-nodejs-sdk-v5', 'dayjs', 'minimist'],
  plugins: [
    resolve({
      preferBuiltins: true
    }),
    commonjs(),
    json(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
      },
      mangle: {
        properties: {
          regex: /^_/  // 只混淆以下划线开头的属性名
        }
      }
    })
  ]
} 