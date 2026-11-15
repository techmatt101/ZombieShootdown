import type { TileMap } from '../../world/TileMap';

export interface IAI {
    think(tileMap : TileMap) : void;
    update(dt : number) : void;
}
