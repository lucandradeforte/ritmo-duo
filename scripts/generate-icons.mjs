import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const publicDirectory = path.join(projectDirectory, 'public');
const sourcePath = path.join(publicDirectory, 'app-icon-v3-source.png');
const background = { r: 9, g: 11, b: 9, alpha: 1 };

await mkdir(publicDirectory, { recursive: true });

const renderTransparent = async (size, fileName) => {
  await sharp(sourcePath)
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
        input: await sharp(sourcePath)
          .resize(size, size, { fit: 'contain' })
          .png()
          .toBuffer(),
      },
    ])
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(publicDirectory, fileName));
};

await Promise.all([
  renderTransparent(192, 'pwa-icon-v3-192x192.png'),
  renderTransparent(512, 'pwa-icon-v3-512x512.png'),
  renderOpaque(512, 'pwa-icon-v3-maskable-512x512.png'),
  renderOpaque(180, 'apple-touch-icon-v3.png'),
]);

console.log('Icones do Ritmo Duo gerados em public/.');
