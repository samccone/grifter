import typescript from 'rollup-plugin-typescript';

export default {
  entry: './index.ts',
  plugins: [
    typescript()
  ],
  sourceMap: true,
  dest: 'dist/dist.js'
}
