const fs = require('node:fs');
const path = require('node:path');
const sharp = require('C:/Users/joelx/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

async function optimize(name) {
  const input = fs.readFileSync(path.join('assets', name + '.glb'));
  const jsonLength = input.readUInt32LE(12);
  const json = JSON.parse(input.subarray(20, 20 + jsonLength).toString());
  const bin = input.subarray(28 + jsonLength);
  const replacements = new Map();
  for (const image of json.images || []) {
    if (image.bufferView === undefined) continue;
    const view = json.bufferViews[image.bufferView];
    const bytes = bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
    const metadata = await sharp(bytes).metadata();
    let pipeline = sharp(bytes).resize({ width: name === 'joel_wave' ? 1024 : 768, height: name === 'joel_wave' ? 1024 : 768, fit: 'inside', withoutEnlargement: true });
    const optimized = metadata.hasAlpha
      ? await pipeline.png({ palette: true, quality: 95, compressionLevel: 9 }).toBuffer()
      : await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    if (optimized.length < bytes.length) {
      replacements.set(image.bufferView, optimized);
      image.mimeType = metadata.hasAlpha ? 'image/png' : 'image/jpeg';
    }
  }
  const chunks = [];
  const shared = new Map();
  let offset = 0;
  json.bufferViews.forEach((view, index) => {
    const bytes = replacements.get(index) || bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
    const key = bytes.toString('base64');
    if (shared.has(key)) { view.byteOffset = shared.get(key); view.byteLength = bytes.length; return; }
    const padding = (4 - offset % 4) % 4;
    if (padding) { chunks.push(Buffer.alloc(padding)); offset += padding; }
    view.byteOffset = offset; view.byteLength = bytes.length;
    shared.set(key, offset);
    chunks.push(bytes); offset += bytes.length;
  });
  json.buffers[0].byteLength = offset;
  let binary = Buffer.concat(chunks);
  binary = Buffer.concat([binary, Buffer.alloc((4 - binary.length % 4) % 4)]);
  let encoded = Buffer.from(JSON.stringify(json));
  encoded = Buffer.concat([encoded, Buffer.alloc((4 - encoded.length % 4) % 4, 32)]);
  const header = Buffer.alloc(20); header.write('glTF'); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + encoded.length + binary.length, 8); header.writeUInt32LE(encoded.length, 12); header.write('JSON', 16);
  const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(binary.length); binHeader.write('BIN\0', 4);
  fs.mkdirSync('assets/optimized', { recursive: true });
  const output = Buffer.concat([header, encoded, binHeader, binary]);
  fs.writeFileSync(path.join('assets/optimized', name + '.glb'), output);
  console.log(`${name}: ${(input.length / 1048576).toFixed(2)} → ${(output.length / 1048576).toFixed(2)} MB`);
}
Promise.all(['frog', 'bear', 'dog', 'joel_wave'].map(optimize)).catch(error => { console.error(error); process.exitCode = 1; });
