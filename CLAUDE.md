# Zombie Shootdown

2D top-down zombie shooter on an endless, procedurally generated, chunk-streamed world. TypeScript 7 + Vite 8, Canvas 2D, no runtime dependencies.

## Commands

```sh
pnpm dev          # dev server; ?dev boots the endless dev level, ?seed=<n> fixes the world seed
pnpm build        # typecheck + production build
pnpm typecheck
pnpm lint         # oxlint (rules in .oxlintrc.json)
pnpm test         # vitest unit tests (*.test.ts next to the module)
pnpm check        # typecheck + lint + tests; run before committing
```

Set `debug: true` in `src/config.ts` for the perf overlay (fps, update/lighting/render ms, chunks, entities, collision pairs), collision boxes, and `window.game` / `window.debug` console access.

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
  - `recordingContext()` / `fakeCanvas()` record canvas draw calls.
- **Dependencies:** depend on interfaces (e.g. `ChunkSource`, not `ChunkStreamer`) so systems can be tested with fakes.

## Code style

- **No comments** (including JSDoc and TODOs). Make intent readable through names: descriptive variables, named constants instead of magic numbers, small named methods.
- **Types:** strict TypeScript; `#private` fields (not `private`); `import type` for type-only imports.
- **Module shape:** ES modules; plain exported functions instead of static-only classes.

## Architecture

The engine is entity/component based: entities are built from components, systems do the per-frame work, and interactions between entities go through dominant/passive **behaviours**. Components only know their own entity and constructor-injected collaborators; anything that needs level-wide data (the tile map) gets it from a system.

- `src/world/`: the endless world. Infrastructure only, no game rules.
  - `generateChunk.ts`: a pure function of `(seed, cx, cy)` that returns a 16×16 tile chunk, with rooms, corridors, doorway openings, doors and zombie spawns. Shared chunk edges get deterministic openings, so chunks line up without seeing each other. Tuning constants live at the top of the file.
  - `ChunkStreamer.ts`: streams chunks around the camera via the `workers/worldgen.ts` worker (generation and bitmap rendering happen off the main thread), unloads far chunks (which regenerate identically from the seed), and fires `ChunkEvent.LOADED` / `UNLOADED` through `EventHandler`.
  - `TileMap.ts`: tile queries over the loaded chunks: `isSolidTile`, `setTile`, grid DDA `raycast` / `hasLineOfSight` (`raycast.ts`), corners, and open-floor lookups.
  - `WorldLayer.ts`: draws only the visible chunk bitmaps.
- `src/core/`:
  - **Components:** `Collision`, `Movement`, `Health`, `Door`, `Interactor`, `Interactable`, …
  - **Systems:**
    - `CollisionSystem`: `SpatialHash` for entity pairs, plus tile lookups.
    - `InteractionSystem`: nearest `Interactable` in reach; when interact is pressed, runs the matching behaviours.
    - `AISystem`: a per-frame think budget; passes the `TileMap` to `IAI.think`.
    - `LogicSystem` and `RenderSystem`.
  - **Collision layers:** `Collision` has a `layer` and a `mask` (`CollisionLayer.PLAYER` / `ENEMY` / `PROJECTILE`). A pair only interacts when each mask includes the other's layer. Walls and closed doors block every moving entity.
  - **Pooling:** pooled entities call `reset()` on every component when reused, so stateful components (AI, movement, damage cooldowns) implement `reset()`.
  - **Behaviours:** `behaviours/` with `CollisionBehaviourList` (damage) and `InteractionBehaviourList` (`openDoor`). Pairs fire when one side is dominant and the other passive.
  - **Doors:**
    - Entities from `factories/DoorFactory.ts` (`Material` + `Door` + `Interactable`), pooled and placed per chunk by `level/DoorSpawner.ts`, which also remembers open doors across unloads.
    - The `Door` component writes its tiles (door ↔ floor) into the `TileMap`, so collision, bullets, line of sight and light all respect it.
    - The player opens doors via `DoorInteractionBehavior` on its `Interactor`, bound to the `INTERACT` action (E / right click).
  - `CanvasRenderer`: culls entities outside the camera view.
- `src/lighting/visibility.ts`: visibility polygon from grid raycasts at nearby wall corners; used by `LightFilter`.
- `src/client/`:
  - Game modes: `SinglePlayerGame` with `SinglePlayerWaveLogic` (Arcade) or `AmbientZombieLogic` (Dev Level).
  - HUD, menu, perf overlay.
