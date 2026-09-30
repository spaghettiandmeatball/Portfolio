import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFileSync(resolve(root, name), 'utf8');
// Normalize Git's Windows line endings so versions are stable across machines.
const version = name => createHash('sha256').update(read(name).replace(/\r\n/g, '\n')).digest('hex').slice(0, 12);
let app = read('app.js');
for (const name of ['project-player.js', 'project-copy.js']) {
  const reference = new RegExp(`(['"])\\./${name.replaceAll('.', '\\.')}([?]v=[^'"]+)?\\1`, 'g');
  app = app.replace(reference, `'./${name}?v=${version(name)}'`);
}
writeFileSync(resolve(root, 'app.js'), app);
let html = read('index.html');
for (const name of ['style.css', 'app.js']) {
  const reference = new RegExp(`(["'])\\./${name.replaceAll('.', '\\.')}([?]v=[^"']+)?\\1`, 'g');
  html = html.replace(reference, `"./${name}?v=${version(name)}"`);
}
writeFileSync(resolve(root, 'index.html'), html);
console.log('Updated stylesheet and application versions.');
