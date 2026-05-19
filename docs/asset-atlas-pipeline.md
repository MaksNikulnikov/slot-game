# Asset Atlas Pipeline

## Purpose

Slot symbol source PNGs live in `assets/images/slot-symbols`. The folder owns an
`atlas.manifest.json` file that describes how source images are packed into a
Pixi-compatible spritesheet.

Generated runtime files are written to `public/assets/atlases`:

- `slot-symbols.json`
- `slot-symbols.png`

## Command

```bash
npm run assets:atlas
```

The command scans `assets/images/**` for `atlas.manifest.json` files and builds
all declared atlases. It also runs automatically before `npm run dev` and
`npm run build`.

## Manifest

```json
{
  "atlasName": "slot-symbols",
  "maxSize": 1024,
  "resolution": 1,
  "padding": 6,
  "output": "public/assets/atlases",
  "images": [
    {
      "name": "slot.cherry",
      "file": "chery.png",
      "scale": 0.62,
      "trim": true,
      "anchor": { "x": 0.5, "y": 0.5 }
    }
  ]
}
```

Runtime loading is centralized in
`src/presentation/assets/GameAssetLoader.ts`. Slot views receive textures by
domain symbol name, so the rendering layer does not know source file names.
