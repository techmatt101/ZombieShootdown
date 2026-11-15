import { DoorInteractionBehavior } from '../behaviours/DoorInteractionBehavior';
import { Door, type DoorTile } from '../components/Door';
import { Interactable } from '../components/Interactable';
import { Material } from '../components/Material';
import { Entity } from '../Entity';
import { ZIndexLayer } from '../level/ZIndexLayer';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { Texture } from '../../lib/Texture';
import { CHUNK_TILES, TILE_SIZE } from '../../world/constants';
import { DoorSide, type ChunkData, type ChunkDoor } from '../../world/generateChunk';
import type { TileMap } from '../../world/TileMap';

const ATLAS_TILE_SIZE = 8;
const DOOR_ATLAS_ROW = 1;
const CLOSED_DOOR_ATLAS_COLUMN = 1;
const OPEN_DOOR_ATLAS_COLUMN = 2;
const HALF_TILE = TILE_SIZE / 2;
const QUARTER_TURN = Math.PI / 2;

const doorTextures = new Map<string, Texture>();

function doorTexture(atlas : CanvasImageSource, side : DoorSide, width : number, isOpen : boolean) : Texture {
    const key = `${side}:${width}:${isOpen}`;
    const cached = doorTextures.get(key);
    if (cached !== undefined) {
        return cached;
    }

    const isTopDoor = side === DoorSide.TOP;
    const length = width * TILE_SIZE;
    const canvas = new OffscreenCanvas(isTopDoor ? length : TILE_SIZE, isTopDoor ? TILE_SIZE : length);
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error('OffscreenCanvas 2D context is not supported');
    }
    ctx.imageSmoothingEnabled = false;
    const sourceX = (isOpen ? OPEN_DOOR_ATLAS_COLUMN : CLOSED_DOOR_ATLAS_COLUMN) * ATLAS_TILE_SIZE;
    for (let i = 0; i < width; i++) {
        const along = (i + 0.5) * TILE_SIZE;
        ctx.setTransform(1, 0, 0, 1, isTopDoor ? along : HALF_TILE, isTopDoor ? HALF_TILE : along);
        if (!isTopDoor) {
            ctx.rotate(QUARTER_TURN);
        }
        ctx.drawImage(atlas, sourceX, DOOR_ATLAS_ROW * ATLAS_TILE_SIZE, ATLAS_TILE_SIZE, ATLAS_TILE_SIZE,
            -HALF_TILE, -HALF_TILE, TILE_SIZE, TILE_SIZE);
    }

    const texture = new Texture(canvas, new Vector(0, 0), canvas.width, canvas.height, new Vector(0, 0), canvas.width, canvas.height);
    doorTextures.set(key, texture);
    return texture;
}

export function spawnDoor(tileMap : TileMap) {
    const door = new Entity('Door', new Point(0, 0, 0), new Box(TILE_SIZE, TILE_SIZE));

    const material = door.addComponent(new Material());
    material.zIndex = ZIndexLayer.BACKGROUND;
    const doorControl = door.addComponent(new Door(door.geometry, material, tileMap));
    const interactable = door.addComponent(new Interactable());

    interactable.behaviours.openDoor = new DoorInteractionBehavior()
        .beOpenedBy(doorControl);

    door.build();

    return door;
}

export function fitDoor(door : Entity, chunk : ChunkData, chunkDoor : ChunkDoor, isOpen : boolean, atlas : CanvasImageSource) {
    const isTopDoor = chunkDoor.side === DoorSide.TOP;
    const firstTileX = chunk.cx * CHUNK_TILES + (isTopDoor ? chunkDoor.start : 0);
    const firstTileY = chunk.cy * CHUNK_TILES + (isTopDoor ? 0 : chunkDoor.start);
    const tiles : DoorTile[] = [];
    for (let i = 0; i < chunkDoor.width; i++) {
        tiles.push({ x: firstTileX + (isTopDoor ? i : 0), y: firstTileY + (isTopDoor ? 0 : i) });
    }

    const widthInPixels = (isTopDoor ? chunkDoor.width : 1) * TILE_SIZE;
    const heightInPixels = (isTopDoor ? 1 : chunkDoor.width) * TILE_SIZE;
    door.geometry.width = widthInPixels;
    door.geometry.height = heightInPixels;
    door.pos.set(firstTileX * TILE_SIZE + widthInPixels / 2, firstTileY * TILE_SIZE + heightInPixels / 2);

    door.getComponent('door').fit(
        tiles,
        doorTexture(atlas, chunkDoor.side, chunkDoor.width, true),
        doorTexture(atlas, chunkDoor.side, chunkDoor.width, false),
        isOpen
    );
}
