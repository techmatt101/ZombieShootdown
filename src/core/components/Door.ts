import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { Material } from './Material';
import { EventHandler, type IObserver, type Listener } from '../../lib/EventHandler';
import type { Entity } from '../Entity';
import type { Box } from '../../lib/geometry/Box';
import type { Texture } from '../../lib/Texture';
import type { TileMap } from '../../world/TileMap';
import { TileType } from '../../world/TileType';

const DOORWAY_CLEARANCE = 1;

export enum DoorEvent {
    TOGGLED,
}

export interface DoorTile {
    x : number;
    y : number;
}

export class Door implements IComponent, IObserver<DoorEvent> {
    active = true;
    isOpen = false;

    #material : Material;
    #tileMap : TileMap;
    #box : Box;
    #tiles : DoorTile[] = [];
    #openTexture : Texture | null = null;
    #closedTexture : Texture | null = null;
    #eventHandler = new EventHandler<DoorEvent>();

    static reference(components : IComponentDirectory) {
        return components.door;
    }

    constructor(box : Box, material : Material, tileMap : TileMap) {
        this.#box = box;
        this.#material = material;
        this.#tileMap = tileMap;
    }

    fit(tiles : DoorTile[], openTexture : Texture, closedTexture : Texture, isOpen : boolean) {
        this.#tiles = tiles;
        this.#openTexture = openTexture;
        this.#closedTexture = closedTexture;
        this.#setOpen(isOpen);
    }

    toggle(opener : Entity) {
        const isClosing = this.isOpen;
        if (isClosing) {
            this.#moveOutOfDoorway(opener);
        }
        this.#setOpen(!isClosing);
        this.#eventHandler.fire(DoorEvent.TOGGLED);
    }

    #moveOutOfDoorway(entity : Entity) {
        const door = this.#box, body = entity.geometry;
        if (!door.isBoundingBoxWith(body)) return;

        const spansHorizontally = door.width > door.height;
        if (spansHorizontally) {
            const offsetToClear = door.height / 2 + body.height / 2 + DOORWAY_CLEARANCE;
            const isAboveCentre = body.pos.y < door.pos.y;
            entity.pos.y = door.pos.y + (isAboveCentre ? -offsetToClear : offsetToClear);
        } else {
            const offsetToClear = door.width / 2 + body.width / 2 + DOORWAY_CLEARANCE;
            const isLeftOfCentre = body.pos.x < door.pos.x;
            entity.pos.x = door.pos.x + (isLeftOfCentre ? -offsetToClear : offsetToClear);
        }
    }

    #setOpen(isOpen : boolean) {
        this.isOpen = isOpen;
        const tileType = isOpen ? TileType.FLOOR : TileType.DOOR;
        const tiles = this.#tiles;
        for (let i = 0; i < tiles.length; i++) {
            this.#tileMap.setTile(tiles[i].x, tiles[i].y, tileType);
        }
        const texture = isOpen ? this.#openTexture : this.#closedTexture;
        if (texture !== null) {
            this.#material.setTexture(texture);
        }
    }

    update(dt : number) : void {
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.door = this;
    }

    on(event : DoorEvent, callback : Listener) {
        this.#eventHandler.add(event, callback);
    }

    off() {
    }
}
