# src/site — the client's design

Everything that makes a client's site look different goes here, so the rest of the template (admin, data,
caching, security) never has to change per client:

- components, styles and fonts of the design;
- graphic effects (WebGL / shaders on images, scroll effects), written as client components.

The routes in `src/app/(frontend)` stay thin: they read data with `src/lib/data.ts` and render components from here.

## Effects must degrade

Each effect needs a plain version that works without JavaScript, WebGL or motion:

1. Render the normal `<Photo>` from the server.
2. Wrap it in a client component that calls `useEnhance` (`use-enhance.ts`). The effect starts only if the visitor
   has not asked for reduced motion and WebGL is available, and it is cleaned up on unmount.
3. Keep the image load lazy and the effect's own files out of the first load (dynamic `import()` inside `setup`).

The Content-Security-Policy in `next.config.mjs` blocks other origins: add fonts, video or analytics hosts there.
Textures read from the photo bucket in WebGL need CORS on the bucket (`Access-Control-Allow-Origin`).
