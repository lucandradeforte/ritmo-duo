import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const publicDirectory = path.join(projectDirectory, 'public');
const sourcePath = path.join(publicDirectory, 'favicon.svg');
const background = { r: 9, g: 11, b: 9, alpha: 1 };

await mkdir(publicDirectory, { recursive: true });

const source = await readFile(sourcePath);
const opaqueSource = Buffer.from(
  source
    .toString()
    .replace(
      '<rect x="20" y="20" width="472" height="472" rx="116" fill="url(#surface)"/>',
      '<rect width="512" height="512" fill="url(#surface)"/>',
    ),
);

const renderTransparent = async (size, fileName) => {
  await sharp(source, { density: 512 })
    .resize(size, size, { fit: 'contain' })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(publicDirectory, fileName));
};

const renderOpaque = async (size, fileName) => {
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([
      {
        input: await sharp(opaqueSource, { density: 512 })
          .resize(size, size, { fit: 'contain' })
          .png()
          .toBuffer(),
      },
    ])
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(publicDirectory, fileName));
};

await Promise.all([
  renderTransparent(192, 'pwa-icon-v2-192x192.png'),
  renderTransparent(512, 'pwa-icon-v2-512x512.png'),
  renderOpaque(512, 'pwa-icon-v2-maskable-512x512.png'),
  renderOpaque(180, 'apple-touch-icon-v2.png'),
]);

console.log('Icones do Ritmo Duo gerados em public/.');
