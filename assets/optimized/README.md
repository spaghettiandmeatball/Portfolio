# Portfolio delivery assets

The original assets remain in `assets/` for reference. The portfolio uses these smaller model and project-image copies.

- Models: embedded textures resized and recompressed; duplicate binary payloads shared. Geometry, skinning, and animation bytes are unchanged. Regenerate with `node tools/optimize-models.cjs` using the bundled Sharp runtime.
- Project images: WebP at up to 1400px wide, quality 86.
- Videos: `assets/videos/previews/` contains 12-second H.264 loops and JPEG posters. Full originals remain in `assets/videos/` and load for the currently selected project after the scene is ready. The full clip takes over after it can play and has sought to the preview's position. Data-saving connections keep the short preview.
- Fonts: local WOFF2 copies in `assets/`, with DM Sans and DM Serif Display license files alongside them. No Google Fonts stylesheet is requested by the portfolio.

Normal entry uses a skippable greeting lasting 3–5 seconds. The three main models preload first and appear in position. Joel warms up in the background after the main crew is ready. The timeout releases the page even when models are still loading. `?splash=preview` holds the greeting open for review.
