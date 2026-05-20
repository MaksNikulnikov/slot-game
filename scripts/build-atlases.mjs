#!/usr/bin/env node

import { Buffer } from "node:buffer";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { deflateSync, inflateSync } from "node:zlib";

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const MANIFEST_FILE = "atlas.manifest.json";
const DEFAULT_IMAGES_ROOT = resolve("assets/images");
const DEFAULT_OUTPUT_ROOT = resolve("public/assets/atlases");
const TRANSPARENT_ALPHA_THRESHOLD = 4;
const MAX_ATLAS_SIDE = 2048;

const crcTable = createCrcTable();

function main() {
  const imagesRoot = resolve(process.argv[2] ?? DEFAULT_IMAGES_ROOT);
  const manifests = findManifestFiles(imagesRoot);

  if (manifests.length === 0) {
    console.log(`No ${MANIFEST_FILE} files found under ${relative(process.cwd(), imagesRoot)}.`);
    return;
  }

  for (const manifestPath of manifests) {
    buildAtlas(manifestPath);
  }
}

function findManifestFiles(rootDir) {
  const results = [];

  function walk(dir) {
    for (const entryName of readdirSync(dir)) {
      const entryPath = join(dir, entryName);
      const stats = statSync(entryPath);

      if (stats.isDirectory()) {
        walk(entryPath);
        continue;
      }

      if (entryName === MANIFEST_FILE) {
        results.push(entryPath);
      }
    }
  }

  walk(rootDir);
  return results.sort((left, right) => left.localeCompare(right));
}

function buildAtlas(manifestPath) {
  const manifestDir = dirname(manifestPath);
  const manifest = readManifest(manifestPath);
  const atlasName = validateText(manifest.atlasName, "atlasName");
  const maxSize = validateMaxAtlasSize(manifest.maxSize, "maxSize");
  const resolution = validatePositiveNumber(manifest.resolution ?? 1, "resolution");
  const padding = validateNonNegativeInteger(manifest.padding ?? 2, "padding");
  const outputRoot = resolve(manifest.output ?? DEFAULT_OUTPUT_ROOT);
  const entries = validateEntries(manifest.images);
  const sprites = entries.map((entry, index) =>
    createSpriteInput(entry, index, manifestDir)
  );
  const placements = packSprites(sprites, maxSize, padding);
  const atlas = createAtlasBitmap(placements);
  validateAtlasBitmapSize(atlas, maxSize, atlasName);
  const atlasImageName = `${atlasName}.png`;
  const atlasJsonName = `${atlasName}.json`;
  const frames = {};

  for (const placement of placements.slice().sort((left, right) => left.index - right.index)) {
    frames[placement.name] = {
      frame: {
        x: placement.x,
        y: placement.y,
        w: placement.image.width,
        h: placement.image.height,
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: placement.image.width,
        h: placement.image.height,
      },
      sourceSize: {
        w: placement.image.width,
        h: placement.image.height,
      },
      anchor: placement.anchor,
    };
  }

  const atlasData = {
    frames,
    meta: {
      app: "pixi-slot-game/scripts/build-atlases",
      version: "1.0",
      image: atlasImageName,
      format: "RGBA8888",
      size: { w: atlas.width, h: atlas.height },
      scale: String(resolution),
    },
  };

  mkdirSync(outputRoot, { recursive: true });
  writeFileSync(join(outputRoot, atlasImageName), encodePng(atlas));
  writeFileSync(join(outputRoot, atlasJsonName), `${JSON.stringify(atlasData, null, 2)}\n`);

  console.log(
    `Built ${relative(process.cwd(), join(outputRoot, atlasJsonName))}: ` +
      `${placements.length} sprites, ${atlas.width}x${atlas.height}px @${resolution}x.`
  );
}

function readManifest(manifestPath) {
  try {
    return JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read ${manifestPath}: ${getErrorMessage(error)}`, {
      cause: error,
    });
  }
}

function validateEntries(images) {
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error("Manifest must contain a non-empty images array.");
  }

  return images.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new Error(`images[${index}] must be an object.`);
    }

    return {
      name: validateText(entry.name, `images[${index}].name`),
      file: validateText(entry.file, `images[${index}].file`),
      scale: validatePositiveNumber(entry.scale ?? 1, `images[${index}].scale`),
      trim: entry.trim !== false,
      anchor: validateAnchor(entry.anchor, `images[${index}].anchor`),
    };
  });
}

function validateText(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string.`);
  }

  return value.trim();
}

function validatePositiveNumber(value, fieldName) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive number.`);
  }

  return value;
}

function validatePositiveInteger(value, fieldName) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }

  return value;
}

function validateMaxAtlasSize(value, fieldName) {
  const maxSize = validatePositiveInteger(value, fieldName);

  if (maxSize > MAX_ATLAS_SIDE) {
    throw new Error(`${fieldName} must not exceed ${MAX_ATLAS_SIDE}px.`);
  }

  return maxSize;
}

function validateAtlasBitmapSize(atlas, maxSize, atlasName) {
  if (atlas.width > maxSize || atlas.height > maxSize) {
    throw new Error(
      `${atlasName} atlas is ${atlas.width}x${atlas.height}px, ` +
        `which exceeds its ${maxSize}px maxSize.`
    );
  }

  if (atlas.width > MAX_ATLAS_SIDE || atlas.height > MAX_ATLAS_SIDE) {
    throw new Error(
      `${atlasName} atlas is ${atlas.width}x${atlas.height}px, ` +
        `which exceeds the global ${MAX_ATLAS_SIDE}px side limit.`
    );
  }
}

function validateNonNegativeInteger(value, fieldName) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${fieldName} must be a non-negative integer.`);
  }

  return value;
}

function validateAnchor(value, fieldName) {
  if (value === undefined) {
    return { x: 0.5, y: 0.5 };
  }

  if (
    !value ||
    typeof value !== "object" ||
    typeof value.x !== "number" ||
    typeof value.y !== "number"
  ) {
    throw new Error(`${fieldName} must be an object with numeric x and y.`);
  }

  return { x: value.x, y: value.y };
}

function createSpriteInput(entry, index, manifestDir) {
  const filePath = resolve(manifestDir, entry.file);
  const relativePath = relative(manifestDir, filePath);

  if (
    relativePath.startsWith("..") ||
    relativePath.includes(`..${sep}`) ||
    extname(filePath).toLowerCase() !== ".png"
  ) {
    throw new Error(`${entry.file} must be a PNG inside its manifest folder.`);
  }

  const source = readPng(filePath);
  const trimmed = entry.trim ? trimTransparentPixels(source) : source;
  const image = resizeRgba(trimmed, entry.scale);

  return {
    index,
    name: entry.name,
    sourceFile: basename(filePath),
    anchor: entry.anchor,
    image,
  };
}

function packSprites(sprites, maxSize, padding) {
  const sortedSprites = sprites
    .slice()
    .sort(
      (left, right) =>
        right.image.height - left.image.height ||
        right.image.width - left.image.width ||
        left.index - right.index
    );
  const placements = [];
  let cursorX = padding;
  let cursorY = padding;
  let rowHeight = 0;
  let atlasWidth = padding;
  let atlasHeight = padding;

  for (const sprite of sortedSprites) {
    if (sprite.image.width + padding * 2 > maxSize || sprite.image.height + padding * 2 > maxSize) {
      throw new Error(`${sprite.sourceFile} does not fit into ${maxSize}px atlas.`);
    }

    if (cursorX + sprite.image.width + padding > maxSize) {
      cursorX = padding;
      cursorY += rowHeight + padding;
      rowHeight = 0;
    }

    if (cursorY + sprite.image.height + padding > maxSize) {
      throw new Error(`Atlas overflow while packing ${sprite.sourceFile}.`);
    }

    placements.push({
      ...sprite,
      x: cursorX,
      y: cursorY,
    });

    cursorX += sprite.image.width + padding;
    rowHeight = Math.max(rowHeight, sprite.image.height);
    atlasWidth = Math.max(atlasWidth, cursorX);
    atlasHeight = Math.max(atlasHeight, cursorY + rowHeight + padding);
  }

  return placements.map((placement) => ({
    ...placement,
    atlasWidth: Math.max(1, atlasWidth),
    atlasHeight: Math.max(1, atlasHeight),
  }));
}

function createAtlasBitmap(placements) {
  const width = Math.max(...placements.map((placement) => placement.atlasWidth));
  const height = Math.max(...placements.map((placement) => placement.atlasHeight));
  const pixels = Buffer.alloc(width * height * 4);

  for (const placement of placements) {
    blitRgba(placement.image, pixels, width, placement.x, placement.y);
  }

  return { width, height, pixels };
}

function readPng(filePath) {
  const bytes = readFileSync(filePath);

  if (!bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error(`${filePath} is not a PNG file.`);
  }

  let offset = PNG_SIGNATURE.length;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks = [];

  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);

    offset += length + 12;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];

      if (data[12] !== 0) {
        throw new Error(`${filePath} uses interlaced PNG data, which is not supported.`);
      }
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`${filePath} must be an 8-bit RGB or RGBA PNG.`);
  }

  const inflated = inflateSync(Buffer.concat(idatChunks));
  const channels = colorType === 6 ? 4 : 3;
  const rgba = decodeScanlines(inflated, width, height, channels, colorType);

  return { width, height, pixels: rgba };
}

function decodeScanlines(inflated, width, height, channels, colorType) {
  const stride = width * channels;
  const pixels = Buffer.alloc(width * height * 4);
  let sourceOffset = 0;
  let previousRow = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[sourceOffset];
    sourceOffset += 1;
    const filteredRow = inflated.subarray(sourceOffset, sourceOffset + stride);
    const row = Buffer.alloc(stride);

    sourceOffset += stride;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? row[x - channels] : 0;
      const up = previousRow[x] ?? 0;
      const upperLeft = x >= channels ? previousRow[x - channels] : 0;
      row[x] = (filteredRow[x] + getFilterPrediction(filter, left, up, upperLeft)) & 0xff;
    }

    for (let x = 0; x < width; x += 1) {
      const sourceIndex = x * channels;
      const targetIndex = (y * width + x) * 4;
      pixels[targetIndex] = row[sourceIndex];
      pixels[targetIndex + 1] = row[sourceIndex + 1];
      pixels[targetIndex + 2] = row[sourceIndex + 2];
      pixels[targetIndex + 3] = colorType === 6 ? row[sourceIndex + 3] : 255;
    }

    previousRow = row;
  }

  return pixels;
}

function getFilterPrediction(filter, left, up, upperLeft) {
  switch (filter) {
    case 0:
      return 0;
    case 1:
      return left;
    case 2:
      return up;
    case 3:
      return Math.floor((left + up) / 2);
    case 4:
      return paeth(left, up, upperLeft);
    default:
      throw new Error(`Unsupported PNG filter ${filter}.`);
  }
}

function paeth(left, up, upperLeft) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);

  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) {
    return left;
  }

  if (upDistance <= upperLeftDistance) {
    return up;
  }

  return upperLeft;
}

function trimTransparentPixels(image) {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const alpha = image.pixels[(y * image.width + x) * 4 + 3];

      if (alpha > TRANSPARENT_ALPHA_THRESHOLD) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return {
      width: 1,
      height: 1,
      pixels: Buffer.alloc(4),
    };
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const pixels = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceIndex = ((minY + y) * image.width + minX + x) * 4;
      const targetIndex = (y * width + x) * 4;
      image.pixels.copy(pixels, targetIndex, sourceIndex, sourceIndex + 4);
    }
  }

  return { width, height, pixels };
}

function resizeRgba(image, scale) {
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  if (width === image.width && height === image.height) {
    return {
      width,
      height,
      pixels: Buffer.from(image.pixels),
    };
  }

  const pixels = Buffer.alloc(width * height * 4);
  const xRatio = image.width / width;
  const yRatio = image.height / height;

  for (let y = 0; y < height; y += 1) {
    const sourceY = (y + 0.5) * yRatio - 0.5;

    for (let x = 0; x < width; x += 1) {
      const sourceX = (x + 0.5) * xRatio - 0.5;
      const color = samplePremultipliedBilinear(image, sourceX, sourceY);
      const targetIndex = (y * width + x) * 4;
      pixels[targetIndex] = color.r;
      pixels[targetIndex + 1] = color.g;
      pixels[targetIndex + 2] = color.b;
      pixels[targetIndex + 3] = color.a;
    }
  }

  return { width, height, pixels };
}

function samplePremultipliedBilinear(image, sourceX, sourceY) {
  const x0 = Math.floor(sourceX);
  const y0 = Math.floor(sourceY);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const tx = sourceX - x0;
  const ty = sourceY - y0;
  const samples = [
    { x: x0, y: y0, weight: (1 - tx) * (1 - ty) },
    { x: x1, y: y0, weight: tx * (1 - ty) },
    { x: x0, y: y1, weight: (1 - tx) * ty },
    { x: x1, y: y1, weight: tx * ty },
  ];
  let red = 0;
  let green = 0;
  let blue = 0;
  let alpha = 0;

  for (const sample of samples) {
    const clampedX = clamp(sample.x, 0, image.width - 1);
    const clampedY = clamp(sample.y, 0, image.height - 1);
    const index = (clampedY * image.width + clampedX) * 4;
    const a = image.pixels[index + 3] * sample.weight;

    red += (image.pixels[index] * a) / 255;
    green += (image.pixels[index + 1] * a) / 255;
    blue += (image.pixels[index + 2] * a) / 255;
    alpha += a;
  }

  if (alpha <= 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  return {
    r: clamp(Math.round((red * 255) / alpha), 0, 255),
    g: clamp(Math.round((green * 255) / alpha), 0, 255),
    b: clamp(Math.round((blue * 255) / alpha), 0, 255),
    a: clamp(Math.round(alpha), 0, 255),
  };
}

function blitRgba(image, targetPixels, targetWidth, targetX, targetY) {
  for (let y = 0; y < image.height; y += 1) {
    const sourceStart = y * image.width * 4;
    const sourceEnd = sourceStart + image.width * 4;
    const targetStart = ((targetY + y) * targetWidth + targetX) * 4;
    image.pixels.copy(targetPixels, targetStart, sourceStart, sourceEnd);
  }
}

function encodePng(image) {
  const header = Buffer.alloc(13);
  const scanlineLength = image.width * 4 + 1;
  const raw = Buffer.alloc(scanlineLength * image.height);

  header.writeUInt32BE(image.width, 0);
  header.writeUInt32BE(image.height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  for (let y = 0; y < image.height; y += 1) {
    const rowStart = y * scanlineLength;
    const sourceStart = y * image.width * 4;
    raw[rowStart] = 0;
    image.pixels.copy(raw, rowStart + 1, sourceStart, sourceStart + image.width * 4);
  }

  return Buffer.concat([
    PNG_SIGNATURE,
    createChunk("IHDR", header),
    createChunk("IDAT", deflateSync(raw, { level: 9 })),
    createChunk("IEND", Buffer.alloc(0)),
  ]);
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const chunk = Buffer.alloc(8 + data.length + 4);

  chunk.writeUInt32BE(data.length, 0);
  typeBuffer.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);

  return chunk;
}

function createCrcTable() {
  const table = new Uint32Array(256);

  for (let index = 0; index < table.length; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
}

function crc32(data) {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

main();
