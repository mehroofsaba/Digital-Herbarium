# The Digital Herbarium

An illustrated field guide to imaginary plants. Every species here is fictional.

## Run locally
```
npm install
npm run dev
```
## Build
```
npm run build      # outputs ./dist
npm run preview    # test the production build locally
```
## Deploy to Render (Static Site)
Push to GitHub, then create a Static Site on Render pointing at the repo. `render.yaml` sets the build command (`npm install && npm run build`), publish directory (`dist`) and an SPA rewrite to `index.html`.

## Notes
- **Discovery Desk AI** runs in your browser via Transformers.js inside a Web Worker. The first generation downloads the model (a few hundred MB) and caches it. WebGPU is used when available, otherwise WebAssembly (slower). Models are listed in `src/lib/models.js`.
- **Storage**: saved species, notes, favourites and settings live in IndexedDB, tied to this browser profile and device. Use Export in Settings or the Field Journal to back up before clearing site data.
- **Themes**: Conservatory, Midnight Garden, Field Notes (Settings).
- **Artwork**: botanical drawings are procedural SVG (`src/components/BotanicalIllustration.jsx`). Drop extra images in `public/illustrations/` and `public/textures/` as the library grows.
