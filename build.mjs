import { build } from 'esbuild';

await build({
  entryPoints: ['src/plugin.cjs'],
  bundle: true,
  outfile: 'main.js',
  platform: 'browser',
  format: 'cjs',
  target: ['es2020'],
  external: ['obsidian'],
  minify: false,
  sourcemap: false,
  legalComments: 'eof'
});
