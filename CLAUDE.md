# Zombie Shootdown

2D top-down zombie shooter on an endless, procedurally generated, chunk-streamed world. TypeScript 7 + Vite 8, WebGPU rendering (latest Chrome only) with a Canvas 2D HUD overlay, no runtime dependencies.

## Commands

```sh
pnpm dev          # dev server; ?dev boots the endless dev level, ?seed=<n> fixes the world seed
pnpm build        # typecheck + production build
pnpm typecheck
pnpm lint         # oxlint (rules in .oxlintrc.json)
pnpm test         # vitest unit tests (*.test.ts next to the module)
pnpm check        # typecheck + lint + tests; run before committing
```

Press `` ` `` (backtick, or gamepad Back/View) in game to toggle the debug view; `debug: true` in `src/config.ts` starts it on and exposes `window.game` / `window.debug`. The debug view shows the perf overlay (fps, update/lighting/render ms, chunks, entities, collision pairs, draw calls, light points), collision boxes, each light's visibility rays and outline (cyan for sight, orange otherwise).

## Performance rules

Write all code to be as fast as possible. The game loop runs every frame, so per-frame cost matters most.

- **Use indexed `for` loops over arrays**: `for (let i = 0; i < items.length; i++)`. Do not use `for…of`, `forEach`, `map`, `filter`, `reduce`, `some`, `every` or `find*` on arrays. `unicorn/no-array-for-each` enforces part of this.
- **Cache hot arrays and `#private` fields in a local** before looping (`const entities = this.#entities;`).
- **`Map`/`Set` are the only exception**: `for…of` over `.values()`/`.entries()` is allowed where there is no indexed form, and only off the per-frame path. If a collection is walked every frame, keep a parallel array (e.g. `World#chunkList` alongside `World#chunks`, with swap-and-pop removal).
- **No per-frame allocation in hot paths.** Reuse scratch objects (`Box`, `Vector`), reuse arrays with `array.length = 0`, and avoid closures and object literals inside loops.
- **Use typed arrays** (`Uint8Array`, `Float32Array`) for bulk world data, and pass them to/from workers as transferables.
- **Cost must not grow with world size.** Query only what is near the player: chunks around the camera, `SpatialHash` neighbours, grid raycasts. Recompute cached results only when inputs change (e.g. lighting reruns when the light moves or `World.version` changes).
- **Measure changes** with the perf overlay before and after.

## Testing

- **Coverage:** every piece of game logic has unit tests next to it (`Foo.ts` → `Foo.test.ts`). New logic gets tests; bug fixes get a test that fails without the fix.
- **Environment:** tests run in Node with no DOM library.
  - Stub browser globals per test with `vi.stubGlobal` (`Worker`, `OffscreenCanvas`, `requestAnimationFrame`, `window`, `navigator`).
  - Mock image loading with `vi.mock('…/lib/assets', () => ({ loadImage: () => new Promise(() => {}) }))`.
- **Shared fixtures** live in `src/testing/`. They are never imported by game code.
  - `chunksFromRows([...])` builds a tile world from ASCII (`#` wall, `.` floor, `D` door, space rock).
  - `generatedChunks(seed, radius)` builds a world from the real generator.
  - `levelOn(chunks)` assembles a `TopDownLevel` with a `TileMap` and `Camera`.
  - `recordingContext()` records 2D canvas draw calls; `FakeOffscreenCanvas` stands in for `OffscreenCanvas`.
  - `fakeGpu()` is a fake `GPUDevice`/canvas context that records render passes, pipelines and draws; call `stubGpuGlobals()` first for `GPUBufferUsage` / `GPUTextureUsage` / `GPUShaderStage`.
- **Dependencies:** depend on interfaces (e.g. `ChunkSource`, not `ChunkStreamer`) so systems can be tested with fakes.

## Code style

- **No comments** (including JSDoc and TODOs). Make intent readable through names: descriptive variables, named constants instead of magic numbers, small named methods.
- **Types:** strict TypeScript; `#private` fields (not `private`); `import type` for type-only imports.
- **Module shape:** ES modules; plain exported functions instead of static-only classes.
- **Geometry:** `Vector`, `Point`, `Box` and `Circle` (`src/lib/geometry/`) are the value classes and keep their own vector maths. Relationships between shapes (overlap, push-out, swept entry, distance) are pure functions in `overlap.ts` that take shapes and write into a caller-owned scratch `Vector`.

## Architecture

The engine is entity/component based: entities are built from components, systems do the per-frame work, and interactions between entities go through dominant/passive **behaviours**. Components only know their own entity and constructor-injected collaborators; anything that needs level-wide data (the tile map) gets it from a system.

- `src/world/`: the endless world. Infrastructure only, no game rules.
  - `generateChunk.ts`: a pure function of `(seed, cx, cy)` that returns a 16×16 tile chunk, with rooms, corridors, doorway openings, doors, zombie spawns and lamp spawns (`x, y, tint roll`; their own random stream, so they don't shift the rest). Shared chunk edges get deterministic openings, so chunks line up without seeing each other. Tuning constants live at the top of the file.
  - `ChunkStreamer.ts`: streams chunks around the camera via the `workers/worldgen.ts` worker (generation and bitmap rendering happen off the main thread), unloads far chunks (which regenerate identically from the seed), and fires `ChunkEvent.LOADED` / `UNLOADED` through `EventHandler`.
  - `TileMap.ts`: tile queries over the loaded chunks: `isSolidTile`, `setTile`, grid DDA `raycast` / `hasLineOfSight` (`raycast.ts`), corners, and open-floor lookups.
  - `tileAtlas.ts`: the tile atlas's colours plus its normal map turned for each quarter turn (`turnNormals` rotates the encoded vectors, not just the pixels), so rotated floor tiles and side doors shade the right way.
  - `renderChunk.ts`: paints a chunk's colour bitmap and a matching normal-map bitmap in the worker.
  - `WorldLayer.ts`: queues only the visible chunk bitmaps (with their normal maps) into the sprite batch, and releases a chunk's GPU textures when it unloads.
- `src/core/`:
  - **Components:** `Collision`, `Movement`, `Health`, `Door`, `Interactor`, `Interactable`, …
  - **Systems:**
    - `CollisionSystem`: `SpatialHash` for entity pairs, plus tile lookups.
    - `InteractionSystem`: nearest `Interactable` in reach; when interact is pressed, runs the matching behaviours.
    - `AISystem`: a per-frame think budget; passes the `TileMap` to `IAI.think`.
    - `LightingSystem`: hands every shining `Light` (player's torch, muzzle flash, lamps) that can reach the camera view to `LightField`.
    - `LogicSystem` and `RenderSystem`.
  - **Collision layers:** `Collision` has a `layer` and a `mask` (`CollisionLayer.PLAYER` / `ENEMY` / `PROJECTILE` / `PROP`). A pair only interacts when each mask includes the other's layer. Walls and closed doors block every moving entity.
  - **Game lifecycle:** every DOM/window listener a game adds must pass `{ signal: game.signal }`. `Game.end()` (player died) freezes the game and shows the game-over screen. `Game.dispose()` (restart, main menu) aborts all listeners, stops sound, terminates the world worker and frees its GPU resources, so a new game starts clean.
  - **Pooling:** pooled entities call `reset()` on every component when reused, so stateful components (AI, movement, damage cooldowns) implement `reset()`.
  - **Behaviours:** `behaviours/` with `CollisionBehaviourList` (damage) and `InteractionBehaviourList` (`openDoor`). Pairs fire when one side is dominant and the other passive.
  - **Player view and light** (constants in `PlayerFactory`):
    - **Eyes:** the player's own `Light` is their view. It is a sight light with no colour, `VIEW_DISTANCE` across the whole screen in line of sight, so it lights nothing but decides what is in view and what gets remembered.
    - **Torch:** from `spawnTorch`, a long cone `Light` aimed by `player.pos.direction`, shining like an old torch. `OLD_BULB_YELLOW` gives it a yellow tint. Its cone `softEdge` equals the half angle, so the beam fades from its centre line out to both sides. `TORCH_FADE` (`Light.fade`, an exponent on the falloff) makes it die off quickly with distance. A `Flicker` component hums its brightness with an occasional stutter. Other constants: `TORCH_RADIUS`, `TORCH_HALF_ANGLE`, `TORCH_BRIGHTNESS`.
    - The muzzle flash and lamps are plain lights too.
  - **Lamps:**
    - Spooky coloured lights placed per chunk by `level/LampSpawner.ts`, which remembers where each lamp was pushed and whether it was broken.
    - Each lamp (`factories/LampFactory.ts`) is a `PROP` body with `Movement`, so players and zombies shove it. It has a coloured `Light` with glow, flickering via `flickerAt` (shared with the torch's `Flicker`), and a code-drawn lantern sprite with a generated normal map.
    - One bullet breaks it: `Lamp` swaps to broken glass and sputters the light out.
  - **Doors:**
    - Entities from `factories/DoorFactory.ts` (`Material` + `Door` + `Interactable`), pooled and placed per chunk by `level/DoorSpawner.ts`, which also remembers open doors across unloads.
    - The `Door` component writes its tiles (door ↔ floor) into the `TileMap`, so collision, bullets, line of sight and light all respect it.
    - The player opens doors via `DoorInteractionBehavior` on its `Interactor`, bound to the `INTERACT` action (E / right click).
- `src/core/render/`: WebGPU rendering.
  - `SpriteBatch`: one reused `Float32Array` of sprite instances (placement, rect, crop, tint), grouped into runs of the same texture and `SpriteKind` (`SCENE`, `SCENE_IN_SIGHT`, `ADDITIVE`). Each run is one instanced draw.
  - `EntitySprites.ts`: culls entities outside the camera view and queues the rest in z order.
  - `GpuRenderer`: fills the batch (world layer, then entities) each frame and hands it to `gpu/GpuPainter`. `init()` is async (`createGpuContext`), and `paint()` does nothing until it is ready.
  - `gpu/GpuPainter`: per frame:
    1. **Light pass:** adds every light into two `rgba8unorm` targets at once.
       - `light`: rgb = light colour × falloff × cone; a = in view (sight lights only). Cones have soft edges (`CONE_SOFT_EDGE`).
       - `glow`: rgb = glow colour; a = explored (the remembered map mask).
    2. **Blur:** two half-resolution passes (across, then down) soften both targets. The blur radius grows with distance from the player (`NEAR_SHADOW_SOFTNESS` → `FAR_SHADOW_SOFTNESS` over `SOFTEST_SHADOW_DISTANCE`, in `GpuRenderer`), so shadows are crisp close up and soft further out.
    3. **Scene:** draws sprites. `isHiddenOutOfSight` sprites (zombies) are faded by the soft sight channel.
    4. **Composite:** multiplies the scene by `explored × (REMEMBERED_BRIGHTNESS + light × visibility)`, where visibility is 1 in view and `OUT_OF_VIEW_LIGHTING` elsewhere (constants in `GpuRenderer`). So never-seen places stay black, explored ones are very dim, lights brighten them, and lights behind walls show only faintly. Then it adds glow the same way, and additive sprites.
  - **Normal maps:** a `Texture` can carry `normals` laid out like its sprite sheet, in the common green-up convention (green = facing up the screen).
    - **Hand-made maps:** `<sprite>_n.png` in `public/assets/img/` (player, zombie, `tiles_n.png` for the tile atlas), loaded alongside the sprite.
    - **Generated maps:** `lib/spriteNormals.ts` (`normalMapOf`) builds one for sprites without a hand-made map (dead zombies).
    - **Shading:** the sprite shader turns each normal with the sprite and shades it per light colour: each light reaching the pixel (`LIGHT_HEIGHT` above the floor) brightens or darkens the side facing it, relative to a flat surface, by `NORMAL_MAP_STRENGTH`. A green lamp on one side and white torchlight on the other light a zombie differently.
  - **Player firing:** `SpriteAnimator` takes its frames from the factory. The player's animation `playsOnce`: it rests on the idle frame, and `animateFiring` replays the muzzle and smoke frames each time the gun fires.
  - `gpu/GpuContext.ts`: one shared `GPUDevice` per page, reused across games, because Chrome can fail to create a fresh device right after destroying one. `dispose()` frees only the game's own textures and buffers.
  - `gpu/TextureStore` uploads any `TextureSource` once (keyed by the source object), and `gpu/MaskTextures` keeps map-memory masks in sync by version. Shaders live in `gpu/shaders/*.wgsl`, imported with `?raw`.
  - HUD text, the crosshair (`client/Crosshair.ts`, placed with `Camera.worldToScreen`, so lighting never darkens it), the perf overlay and every `drawDebug` draw on the transparent 2D `#hud` canvas stacked over `#game` (`HudCanvas`).
- `src/lighting/`:
  - `visibility.ts`: visibility polygon from grid raycasts at nearby wall corners; used by `LightField`. `cornerSight` decides each corner's rays from the tiles around it:
    - **hidden** (the tile in front of the corner is solid): no ray.
    - **faced** (inside corners, or outer corners seen head-on): one ray.
    - **grazed** (one side open, where a shadow edge starts): two rays just either side.
    - **rim:** 24 extra rays, since the light falls off to nothing before its radius. Scratch angles are reused, so only the returned polygon is allocated.
    - **cones:** with a `LightArc` (cone lights like the torch), only rays inside the arc are cast, plus rays on both edges. The polygon starts at the light, so fans, memory and debug drawing work unchanged.
  - `LightField.ts`: caches each light's visibility polygon, recomputing only when the light moves, a cone turns, or the tiles change, and bumps `version` so the GPU re-uploads light fans (`fanTriangles.ts`) only then.
  - `MapMemory.ts`: Monaco-style map discovery. The player's view (`Light.isSight`) scanline-fills its polygon (`fillPolygon.ts`) into a low-res `Uint8Array` mask per chunk. Explored areas are drawn dimly; never-seen areas stay black. Unloaded chunks keep their mask array.
- `src/client/`:
  - Game modes: `SinglePlayerGame` with `SinglePlayerWaveLogic` (Arcade) or `AmbientZombieLogic` (Dev Level).
  - HUD, menu, perf overlay.
