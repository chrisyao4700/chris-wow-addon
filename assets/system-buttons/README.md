# System button textures

Place `.tga` icons here for **micro menu buttons only** (not backpack/bag slots). See [design/system-buttons/README.md](../../design/system-buttons/README.md) and [design/system-buttons/asset-prompts.md](../../design/system-buttons/asset-prompts.md) for sizes, naming, and generation prompts.

`backpack.tga` and `bag-*.tga` files are unused by the addon and can be removed.

The addon ships a manifest in `src/features/system-buttons/asset-manifest.ts` (update when adding files). Optional state files: `{assetId}-pushed.tga`, `{assetId}-disabled.tga`, `{assetId}-highlight.tga`.

After adding or changing `.tga` files, run `npm run build` (or your dev watcher) and `/reload` in-game. Use `/cwa buttons` to confirm resolved asset counts.
