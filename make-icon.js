const { Jimp } = require('jimp');
const path = require('path');

async function makeRoundedIcon() {
  const size = 1024;
  const radius = 220;

  const logo = await Jimp.read(path.join(__dirname, 'assets/logo.png'));

  // White background
  const bg = new Jimp({ width: size, height: size, color: 0xffffffff });

  // Resize logo with padding
  const padding = 140;
  logo.contain({ w: size - padding * 2, h: size - padding * 2 });

  // Center composite
  bg.composite(logo, padding, padding);

  // Round the corners
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const inCorner =
        (x < radius && y < radius) ||
        (x > size - radius && y < radius) ||
        (x < radius && y > size - radius) ||
        (x > size - radius && y > size - radius);

      if (inCorner) {
        const cx = x < radius ? radius : size - radius;
        const cy = y < radius ? radius : size - radius;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist > radius) {
          bg.setPixelColor(0x00000000, x, y);
        }
      }
    }
  }

  await bg.write(path.join(__dirname, 'assets/icon.png'));
  await bg.write(path.join(__dirname, 'assets/adaptive-icon.png'));
  await bg.write(path.join(__dirname, 'assets/logo-rounded.png'));

  console.log('✅ Rounded icon created successfully!');
}

makeRoundedIcon().catch(console.error);
