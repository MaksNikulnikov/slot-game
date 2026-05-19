import js from "@eslint/js";
import tseslint from "typescript-eslint";

const browserGlobals = {
  AudioContext: "readonly",
  document: "readonly",
  fetch: "readonly",
  HTMLElement: "readonly",
  requestAnimationFrame: "readonly",
  setTimeout: "readonly",
  window: "readonly"
};

const nodeGlobals = {
  Buffer: "readonly",
  console: "readonly",
  process: "readonly"
};

const pixiBoundaryRule = [
  "error",
  {
    paths: [
      {
        name: "pixi.js",
        message: "Pixi imports belong in src/presentation/** only."
      },
      {
        name: "@esotericsoftware/spine-pixi-v8",
        message: "Spine-Pixi imports belong in src/presentation/** only."
      }
    ],
    patterns: [
      {
        group: ["pixi.js/*", "@esotericsoftware/spine-pixi-v8/*"],
        message: "Rendering runtime imports belong in src/presentation/** only."
      }
    ]
  }
];

export default [
  {
    ignores: ["dist/**", "node_modules/**", "project_local/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      globals: browserGlobals
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "separate-type-imports",
          prefer: "type-imports"
        }
      ]
    }
  },
  {
    files: ["src/app/**/*.ts", "src/core/**/*.ts"],
    rules: {
      "no-restricted-imports": pixiBoundaryRule
    }
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: nodeGlobals,
      sourceType: "module"
    }
  },
  {
    files: ["*.cjs"],
    languageOptions: {
      globals: {
        ...nodeGlobals,
        __dirname: "readonly",
        module: "readonly",
        require: "readonly"
      },
      sourceType: "commonjs"
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  }
];
