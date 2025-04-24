import terser from '@rollup/plugin-terser';

export default {
  input: 'index.js',
  output: {
    name: 'GuavaRemoteImportRepo',
    file: 'dist/remote-import-repo.js',
    format: 'iife',
    exports: 'named',
    sourcemap: true,
  },
  plugins: [/*terser()*/],
};