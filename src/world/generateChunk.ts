import { CHUNK_TILES, LAST_TILE, TILE_SIZE, tileIndex } from './constants';
import { createRandom, hashCoords, randomInt, type Random } from './random';
import { TileType } from './TileType';
import { Direction } from './Direction';

export interface EdgeOpening {
    start : number;
    width : number;
    hasDoor : boolean;
}

export enum DoorSide {
    TOP,
    LEFT,
}

export interface ChunkDoor {
    side : DoorSide;
    start : number;
    width : number;
}

export interface ChunkOpenings {
    top : EdgeOpening | null;
    bottom : EdgeOpening | null;
    left : EdgeOpening | null;
    right : EdgeOpening | null;
}

export interface ChunkData {
    cx : number;
    cy : number;
    tiles : Uint8Array;
    wallDirections : Uint8Array;
    floorRotations : Uint8Array;
    corners : Float32Array;
    openFloor : Float32Array;
    zombieSpawns : Float32Array;
    doors : ChunkDoor[];
}

interface Room {
    x : number;
    y : number;
    width : number;
    height : number;
}

interface TilePoint {
    x : number;
    y : number;
}

const OPENING_CHANCE = 0.75;
const DOOR_CHANCE = 0.6;
const EDGE_MARGIN = 3;
const HORIZONTAL_EDGE = 1;
const VERTICAL_EDGE = 2;
const CHUNK_SALT = 3;
const INNER_MIN = 1;
const INNER_MAX = LAST_TILE - 1;
const MIN_ROOM_SIZE = 4;
const MAX_ROOM_SIZE = 9;
const SECOND_ROOM_CHANCE = 0.6;
const ROOM_CORRIDOR_WIDTH = 2;
const MIN_ZOMBIES_PER_ROOM = 2;
const MAX_ZOMBIES_PER_ROOM = 5;

function isSpawnChunkEdge(orientation : number, cx : number, cy : number) {
    return orientation === HORIZONTAL_EDGE
        ? cx === 0 && (cy === 0 || cy === 1)
        : cy === 0 && (cx === 0 || cx === 1);
}

export function edgeOpening(seed : number, orientation : number, cx : number, cy : number) : EdgeOpening | null {
    const random = createRandom(hashCoords(seed, orientation, cx, cy));
    const isOpen = random() < OPENING_CHANCE;
    if (!isOpen && !isSpawnChunkEdge(orientation, cx, cy)) {
        return null;
    }
    const width = randomInt(random, 2, 3);
    const start = randomInt(random, EDGE_MARGIN, CHUNK_TILES - EDGE_MARGIN - width);
    const hasDoor = random() < DOOR_CHANCE;
    return { start, width, hasDoor };
}

export function chunkOpenings(seed : number, cx : number, cy : number) : ChunkOpenings {
    return {
        top: edgeOpening(seed, HORIZONTAL_EDGE, cx, cy),
        bottom: edgeOpening(seed, HORIZONTAL_EDGE, cx, cy + 1),
        left: edgeOpening(seed, VERTICAL_EDGE, cx, cy),
        right: edgeOpening(seed, VERTICAL_EDGE, cx + 1, cy),
    };
}

function covers(opening : EdgeOpening | null, position : number) {
    return opening !== null && position >= opening.start && position < opening.start + opening.width;
}

function clamp(value : number, min : number, max : number) {
    return Math.min(Math.max(value, min), max);
}

class FloorPlan {
    floor = new Uint8Array(CHUNK_TILES * CHUNK_TILES);
    #openings : ChunkOpenings;

    constructor(openings : ChunkOpenings) {
        this.#openings = openings;
    }

    carveInterior(x0 : number, y0 : number, x1 : number, y1 : number) {
        const left = clamp(Math.min(x0, x1), INNER_MIN, INNER_MAX);
        const right = clamp(Math.max(x0, x1), INNER_MIN, INNER_MAX);
        const top = clamp(Math.min(y0, y1), INNER_MIN, INNER_MAX);
        const bottom = clamp(Math.max(y0, y1), INNER_MIN, INNER_MAX);
        for (let y = top; y <= bottom; y++) {
            for (let x = left; x <= right; x++) {
                this.floor[tileIndex(x, y)] = 1;
            }
        }
    }

    carveCorridor(from : TilePoint, to : TilePoint, width : number, verticalFirst : boolean) {
        const corner = verticalFirst ? { x: from.x, y: to.y } : { x: to.x, y: from.y };
        this.carveInterior(from.x, from.y, corner.x + width - 1, corner.y + width - 1);
        this.carveInterior(corner.x, corner.y, to.x + width - 1, to.y + width - 1);
    }

    carveBorderOpening(opening : EdgeOpening, isHorizontalEdge : boolean, borderIndex : number) {
        for (let i = opening.start; i < opening.start + opening.width; i++) {
            const index = isHorizontalEdge ? tileIndex(i, borderIndex) : tileIndex(borderIndex, i);
            this.floor[index] = 1;
        }
    }

    isFloor(x : number, y : number) : boolean {
        const insideX = x >= 0 && x <= LAST_TILE;
        const insideY = y >= 0 && y <= LAST_TILE;
        if (insideX && insideY) {
            return this.floor[tileIndex(x, y)] === 1;
        }
        if (y < 0) return insideX && covers(this.#openings.top, x);
        if (y > LAST_TILE) return insideX && covers(this.#openings.bottom, x);
        if (x < 0) return covers(this.#openings.left, y);
        return covers(this.#openings.right, y);
    }
}

function placeRoom(random : Random) : Room {
    const width = randomInt(random, MIN_ROOM_SIZE, MAX_ROOM_SIZE);
    const height = randomInt(random, MIN_ROOM_SIZE, MAX_ROOM_SIZE);
    return {
        x: randomInt(random, INNER_MIN, INNER_MAX - width + 1),
        y: randomInt(random, INNER_MIN, INNER_MAX - height + 1),
        width,
        height,
    };
}

function roomCentre(room : Room, corridorWidth : number) : TilePoint {
    return {
        x: room.x + Math.floor((room.width - corridorWidth) / 2),
        y: room.y + Math.floor((room.height - corridorWidth) / 2),
    };
}

function nearestRoom(rooms : Room[], point : TilePoint) {
    const distanceTo = (room : Room) => Math.hypot(room.x + room.width / 2 - point.x, room.y + room.height / 2 - point.y);
    let nearest = rooms[0];
    for (let i = 1; i < rooms.length; i++) {
        if (distanceTo(rooms[i]) < distanceTo(nearest)) {
            nearest = rooms[i];
        }
    }
    return nearest;
}

function layOutFloor(openings : ChunkOpenings, random : Random) {
    const plan = new FloorPlan(openings);
    const rooms = [placeRoom(random)];
    if (random() < SECOND_ROOM_CHANCE) {
        rooms.push(placeRoom(random));
    }
    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        plan.carveInterior(room.x, room.y, room.x + room.width - 1, room.y + room.height - 1);
    }
    if (rooms.length === 2) {
        plan.carveCorridor(roomCentre(rooms[0], ROOM_CORRIDOR_WIDTH), roomCentre(rooms[1], ROOM_CORRIDOR_WIDTH), ROOM_CORRIDOR_WIDTH, random() < 0.5);
    }

    const connectOpening = (opening : EdgeOpening | null, isHorizontalEdge : boolean, borderIndex : number, firstInnerIndex : number) => {
        if (opening === null) return;
        plan.carveBorderOpening(opening, isHorizontalEdge, borderIndex);
        const start = isHorizontalEdge ? { x: opening.start, y: firstInnerIndex } : { x: firstInnerIndex, y: opening.start };
        const target = roomCentre(nearestRoom(rooms, start), opening.width);
        plan.carveCorridor(start, target, opening.width, isHorizontalEdge);
    };
    connectOpening(openings.top, true, 0, INNER_MIN);
    connectOpening(openings.bottom, true, LAST_TILE, INNER_MAX);
    connectOpening(openings.left, false, 0, INNER_MIN);
    connectOpening(openings.right, false, LAST_TILE, INNER_MAX);

    return { plan, rooms };
}

function wallDirection(plan : FloorPlan, x : number, y : number) : Direction {
    const floorTo = (dx : number, dy : number) => plan.isFloor(x + dx, y + dy);
    if (floorTo(0, 1)) return Direction.NORTH;
    if (floorTo(0, -1)) return Direction.SOUTH;
    if (floorTo(1, 0)) return Direction.WEST;
    if (floorTo(-1, 0)) return Direction.EAST;
    if (floorTo(1, 1)) return Direction.NORTH_WEST;
    if (floorTo(-1, 1)) return Direction.NORTH_EAST;
    if (floorTo(1, -1)) return Direction.SOUTH_WEST;
    if (floorTo(-1, -1)) return Direction.SOUTH_EAST;
    return Direction.NONE;
}

function isNextToFloor(plan : FloorPlan, x : number, y : number) {
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if ((dx !== 0 || dy !== 0) && plan.isFloor(x + dx, y + dy)) {
                return true;
            }
        }
    }
    return false;
}

function isSurroundedByFloor(plan : FloorPlan, x : number, y : number) {
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (!plan.isFloor(x + dx, y + dy)) {
                return false;
            }
        }
    }
    return true;
}

export function isCornerVertex(letsLightThrough : (x : number, y : number) => boolean, vx : number, vy : number) {
    const topLeft = letsLightThrough(vx - 1, vy - 1);
    const topRight = letsLightThrough(vx, vy - 1);
    const bottomLeft = letsLightThrough(vx - 1, vy);
    const bottomRight = letsLightThrough(vx, vy);
    const floorCount = Number(topLeft) + Number(topRight) + Number(bottomLeft) + Number(bottomRight);
    const isDiagonalPair = floorCount === 2 && topLeft === bottomRight;
    return floorCount === 1 || floorCount === 3 || isDiagonalPair;
}

export function generateChunk(seed : number, cx : number, cy : number) : ChunkData {
    const random = createRandom(hashCoords(seed, CHUNK_SALT, cx, cy));
    const openings = chunkOpenings(seed, cx, cy);
    const { plan, rooms } = layOutFloor(openings, random);
    const doors = ownedDoors(openings);
    const isDoorTile = (x : number, y : number) => {
        for (let i = 0; i < doors.length; i++) {
            const door = doors[i];
            const position = door.side === DoorSide.TOP ? x : y;
            const isOnDoorEdge = door.side === DoorSide.TOP ? y === 0 : x === 0;
            if (isOnDoorEdge && position >= door.start && position < door.start + door.width) {
                return true;
            }
        }
        return false;
    };

    const letsLightThroughWhenDoorsClosed = (x : number, y : number) => plan.isFloor(x, y) && !isDoorTile(x, y);

    const tiles = new Uint8Array(CHUNK_TILES * CHUNK_TILES);
    const wallDirections = new Uint8Array(CHUNK_TILES * CHUNK_TILES);
    const floorRotations = new Uint8Array(CHUNK_TILES * CHUNK_TILES);
    const corners : number[] = [];
    const openFloor : number[] = [];
    const originX = cx * CHUNK_TILES;
    const originY = cy * CHUNK_TILES;
    const tileCentre = (tile : number) => (tile + 0.5) * TILE_SIZE;

    for (let y = 0; y <= LAST_TILE; y++) {
        for (let x = 0; x <= LAST_TILE; x++) {
            const index = tileIndex(x, y);
            if (isDoorTile(x, y)) {
                tiles[index] = TileType.DOOR;
            } else if (plan.isFloor(x, y)) {
                tiles[index] = TileType.FLOOR;
                floorRotations[index] = randomInt(random, 0, 3);
                if (isSurroundedByFloor(plan, x, y)) {
                    openFloor.push(tileCentre(originX + x), tileCentre(originY + y));
                }
            } else if (isNextToFloor(plan, x, y)) {
                tiles[index] = TileType.WALL;
                wallDirections[index] = wallDirection(plan, x, y);
            } else {
                tiles[index] = TileType.ROCK;
            }
            if (isCornerVertex(letsLightThroughWhenDoorsClosed, x, y)) {
                corners.push((originX + x) * TILE_SIZE, (originY + y) * TILE_SIZE);
            }
        }
    }

    const zombieSpawns : number[] = [];
    const isSpawnChunk = cx === 0 && cy === 0;
    if (!isSpawnChunk) {
        for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
            const openTiles = openTilesInRoom(plan, rooms[roomIndex]);
            const zombieCount = Math.min(randomInt(random, MIN_ZOMBIES_PER_ROOM, MAX_ZOMBIES_PER_ROOM), openTiles.length);
            for (let i = 0; i < zombieCount; i++) {
                const pick = randomInt(random, i, openTiles.length - 1);
                const tile = openTiles[pick];
                openTiles[pick] = openTiles[i];
                openTiles[i] = tile;
                zombieSpawns.push(tileCentre(originX + tile.x), tileCentre(originY + tile.y));
            }
        }
    }

    return {
        cx,
        cy,
        tiles,
        wallDirections,
        floorRotations,
        corners: Float32Array.from(corners),
        openFloor: Float32Array.from(openFloor),
        zombieSpawns: Float32Array.from(zombieSpawns),
        doors,
    };
}

function openTilesInRoom(plan : FloorPlan, room : Room) : TilePoint[] {
    const openTiles : TilePoint[] = [];
    for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
            if (isSurroundedByFloor(plan, x, y)) {
                openTiles.push({ x, y });
            }
        }
    }
    return openTiles;
}

function ownedDoors(openings : ChunkOpenings) : ChunkDoor[] {
    const doors : ChunkDoor[] = [];
    if (openings.top?.hasDoor) {
        doors.push({ side: DoorSide.TOP, start: openings.top.start, width: openings.top.width });
    }
    if (openings.left?.hasDoor) {
        doors.push({ side: DoorSide.LEFT, start: openings.left.start, width: openings.left.width });
    }
    return doors;
}
