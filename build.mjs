import { readFile, writeFile } from 'node:fs/promises';

// Ship the readable runtime source without transpilation or minification.
const source = await readFile(new URL('./src/main.js', import.meta.url));
await writeFile(new URL('./main.js', import.meta.url), source);
