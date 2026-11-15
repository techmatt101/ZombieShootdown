ZombieShootdown
==============

Zombie Shootdown is a 2D Top Down Horror Survival Zombie Shooter.
The aim of the game is to survive as long as possible in a zombie apocalypse. 

Players must shoot, dodge and run from zombies to survive wave based levels.

Each new wave brings new challenges to player spawning more, faster and greater health zombies.

The game is over once the players health falls below zero after being bitten by zombies. 

Players can gain points for surviving waves and killing zombies.

Development
-----------

Requires Node 22.12+ and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev        # dev server with hot reload
pnpm build      # typecheck + production build to dist/
pnpm preview    # serve the production build
pnpm lint       # oxlint
```

Built with [Vite](https://vite.dev), TypeScript and [oxlint](https://oxc.rs). Static assets
(images, audio, fonts) live in `public/assets/` and are served as-is; game settings live in `src/config.ts`.
