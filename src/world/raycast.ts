import { TILE_SIZE } from './constants';

export type SolidTileTest = (tileX : number, tileY : number) => boolean;

export function castRay(isSolid : SolidTileTest, originX : number, originY : number, directionX : number, directionY : number, maxDistance : number) {
    let tileX = Math.floor(originX / TILE_SIZE);
    let tileY = Math.floor(originY / TILE_SIZE);
    if (isSolid(tileX, tileY)) {
        return 0;
    }

    const stepX = directionX > 0 ? 1 : -1;
    const stepY = directionY > 0 ? 1 : -1;
    const distancePerTileX = directionX === 0 ? Infinity : Math.abs(TILE_SIZE / directionX);
    const distancePerTileY = directionY === 0 ? Infinity : Math.abs(TILE_SIZE / directionY);
    const nextBoundaryX = directionX > 0 ? (tileX + 1) * TILE_SIZE : tileX * TILE_SIZE;
    const nextBoundaryY = directionY > 0 ? (tileY + 1) * TILE_SIZE : tileY * TILE_SIZE;
    let distanceToNextX = directionX === 0 ? Infinity : (nextBoundaryX - originX) / directionX;
    let distanceToNextY = directionY === 0 ? Infinity : (nextBoundaryY - originY) / directionY;

    while (true) {
        let distance : number;
        if (distanceToNextX < distanceToNextY) {
            distance = distanceToNextX;
            tileX += stepX;
            distanceToNextX += distancePerTileX;
        } else {
            distance = distanceToNextY;
            tileY += stepY;
            distanceToNextY += distancePerTileY;
        }
        if (distance >= maxDistance) {
            return maxDistance;
        }
        if (isSolid(tileX, tileY)) {
            return distance;
        }
    }
}

export function hasClearLine(isSolid : SolidTileTest, fromX : number, fromY : number, toX : number, toY : number) {
    const distance = Math.hypot(toX - fromX, toY - fromY);
    if (distance === 0) {
        return !isSolid(Math.floor(fromX / TILE_SIZE), Math.floor(fromY / TILE_SIZE));
    }
    return castRay(isSolid, fromX, fromY, (toX - fromX) / distance, (toY - fromY) / distance, distance) >= distance;
}
