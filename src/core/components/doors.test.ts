import { describe, expect, it } from 'vitest';
import { Door, DoorEvent } from './Door';
import { Interactable } from './Interactable';
import { Interactor } from './Interactor';
import { Material } from './Material';
import { DoorInteractionBehavior } from '../behaviours/DoorInteractionBehavior';
import { Entity } from '../Entity';
import { InteractionSystem } from '../systems/InteractionSystem';
import { InputAction } from '../../lib/controllers/InputAction';
import { InputState } from '../../lib/controllers/InputState';
import { Box } from '../../lib/geometry/Box';
import { boxesOverlap } from '../../lib/geometry/overlap';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { Texture } from '../../lib/Texture';
import { chunksFromRows } from '../../testing/worldFixtures';
import { TILE_SIZE } from '../../world/constants';
import { TileMap } from '../../world/TileMap';
import { TileType } from '../../world/TileType';

const texture = (name : string) => new Texture({ width: 1, height: 1, name } as unknown as ImageBitmap, new Vector(0, 0), 1, 1);
const openTexture = texture('open'), closedTexture = texture('closed');

function doorAcrossCorridor() {
    const tileMap = new TileMap(chunksFromRows(['#..#', '#DD#', '#..#']));
    const entity = new Entity('Door', new Point(2 * TILE_SIZE, 1.5 * TILE_SIZE, 0), new Box(2 * TILE_SIZE, TILE_SIZE));
    const material = entity.addComponent(new Material());
    const door = entity.addComponent(new Door(entity.geometry, material, tileMap));
    const interactable = entity.addComponent(new Interactable());
    interactable.behaviours.openDoor = new DoorInteractionBehavior().beOpenedBy(door);
    entity.build();
    door.fit([{ x: 1, y: 1 }, { x: 2, y: 1 }], openTexture, closedTexture, false);
    return { tileMap, entity, door, material };
}

function player(x : number, y : number, input = new InputState()) {
    const entity = new Entity('Player', new Point(x, y, 0), new Box(30, 30));
    const interactor = entity.addComponent(new Interactor(input));
    interactor.behaviours.openDoor = new DoorInteractionBehavior().openDoorsAs(entity);
    entity.build();
    return { entity, interactor, input };
}

describe('Door', () => {
    it('writes its tiles and texture to match its state', () => {
        const { tileMap, door, material, entity } = doorAcrossCorridor();
        expect(tileMap.tileAt(1, 1)).toBe(TileType.DOOR);
        expect(tileMap.tileAt(2, 1)).toBe(TileType.DOOR);
        expect(material.texture).toBe(closedTexture);
        door.toggle(player(0, 0).entity);
        expect(door.isOpen).toBe(true);
        expect(tileMap.tileAt(1, 1)).toBe(TileType.FLOOR);
        expect(tileMap.tileAt(2, 1)).toBe(TileType.FLOOR);
        expect(material.texture).toBe(openTexture);
        expect(entity.active).toBe(true);
    });

    it('announces every toggle', () => {
        const { door } = doorAcrossCorridor();
        let toggles = 0;
        door.on(DoorEvent.TOGGLED, () => toggles++);
        door.toggle(player(0, 0).entity);
        door.toggle(player(0, 0).entity);
        expect(toggles).toBe(2);
    });

    it('moves the opener out of the doorway, to the side they are on, when closing', () => {
        const { door, entity } = doorAcrossCorridor();
        door.toggle(player(0, 0).entity);
        const opener = player(2 * TILE_SIZE, 1.5 * TILE_SIZE + 5).entity;
        door.toggle(opener);
        expect(door.isOpen).toBe(false);
        expect(boxesOverlap(opener.geometry, entity.geometry)).toBe(false);
        expect(opener.pos.y).toBeCloseTo(2 * TILE_SIZE + 16);
    });
});

describe('Interactor and InteractionSystem', () => {
    it('only wants to interact on the frame the key goes down', () => {
        const { interactor, input } = player(0, 0);
        input.setKeyPress(InputAction.INTERACT);
        interactor.update(1);
        expect(interactor.wantsToInteract).toBe(true);
        interactor.update(1);
        expect(interactor.wantsToInteract).toBe(false);
    });

    it('targets the nearest interactable in reach and toggles a door on press', () => {
        const { entity: doorEntity, door } = doorAcrossCorridor();
        const { entity: actor, interactor, input } = player(2 * TILE_SIZE, 2.6 * TILE_SIZE);
        const system = new InteractionSystem();
        system.add(doorEntity);
        system.add(actor);

        system.update(1);
        expect(interactor.target).toBe(doorEntity);
        expect(door.isOpen).toBe(false);

        input.setKeyPress(InputAction.INTERACT);
        interactor.update(1);
        system.update(1);
        expect(door.isOpen).toBe(true);
    });

    it('has no target when nothing is within reach', () => {
        const { entity: doorEntity } = doorAcrossCorridor();
        const { entity: actor, interactor } = player(20 * TILE_SIZE, 20 * TILE_SIZE);
        const system = new InteractionSystem();
        system.add(doorEntity);
        system.add(actor);
        system.update(1);
        expect(interactor.target).toBeNull();
    });
});
