import { describe, expect, it } from 'vitest';
import { queueEntitySprites } from './EntitySprites';
import { FLOATS_PER_SPRITE, SpriteBatch, SpriteKind } from './SpriteBatch';
import { Material } from '../components/Material';
import { Entity } from '../Entity';
import { Camera } from '../../lib/Camera';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { Texture } from '../../lib/Texture';

const sheet = { width: 100, height: 50 } as HTMLImageElement;

function sprite(x : number, y : number) {
    const entity = new Entity('Sprite', new Point(x, y, 0), new Box(40, 40));
    entity.addComponent(new Material());
    entity.build();
    return entity;
}

function cameraOnOrigin() {
    const camera = new Camera({ x: 600, y: 300 });
    camera.setTarget(new Vector(0, 0));
    camera.jumpToTarget();
    return camera;
}

function queued(entities : Entity[]) {
    const batch = new SpriteBatch();
    queueEntitySprites(entities, cameraOnOrigin(), batch);
    return batch;
}

function spriteData(batch : SpriteBatch, index : number) {
    return [...batch.data.subarray(index * FLOATS_PER_SPRITE, (index + 1) * FLOATS_PER_SPRITE)];
}

describe('queueEntitySprites', () => {
    it('queues only entities whose sprite reaches the screen', () => {
        expect(queued([sprite(0, 0), sprite(580, 0), sprite(700, 0), sprite(0, -5000)]).count).toBe(2);
    });

    it('skips entities that are inactive or have an inactive material', () => {
        const inactive = sprite(0, 0);
        inactive.active = false;
        const hidden = sprite(0, 0);
        hidden.getComponent('material').active = false;
        expect(queued([inactive, hidden]).count).toBe(0);
    });

    it('keeps the z-ordered entity list order', () => {
        const batch = queued([sprite(1, 0), sprite(2, 0), sprite(3, 0)]);
        expect([batch.data[0], batch.data[FLOATS_PER_SPRITE], batch.data[FLOATS_PER_SPRITE * 2]]).toEqual([1, 2, 3]);
    });

    it('draws an untextured entity as a black box of its own size', () => {
        const entity = sprite(5, 6);
        entity.pos.direction = 1;
        entity.getComponent('material').opacity = 0.5;
        const batch = queued([entity]);
        expect(batch.run(0).source).toBeNull();
        expect(spriteData(batch, 0)).toEqual([5, 6, 1, 0, -20, -20, 40, 40, 0, 0, 1, 1, 0, 0, 0, 0.5]);
    });

    it('places the texture at its offset, rotated with the entity, showing only its source frame', () => {
        const entity = new Entity('Zombie', new Point(10, 20, Math.PI / 2), new Box(48, 48));
        const material = entity.addComponent(new Material());
        entity.build();
        material.setTexture(new Texture(sheet, new Vector(4, -2), 62, 48, new Vector(0, 20), 28, 20));
        const batch = queued([entity]);
        expect(batch.run(0).source).toBe(sheet);
        expect(spriteData(batch, 0)).toEqual([
            10, 20, expect.closeTo(Math.PI / 2), 0,
            -20, -26, 62, 48,
            0, expect.closeTo(0.4), expect.closeTo(0.28), expect.closeTo(0.8),
            1, 1, 1, 1,
        ]);
    });

    it('sorts each sprite into how it is drawn: plain, only in sight, or added as light', () => {
        const plain = sprite(0, 0);
        const zombie = sprite(0, 0);
        zombie.getComponent('material').isHiddenOutOfSight = true;
        const glow = sprite(0, 0);
        glow.getComponent('material').isAdditive = true;
        const batch = queued([plain, zombie, glow]);
        expect([batch.run(0).kind, batch.run(1).kind, batch.run(2).kind]).toEqual([SpriteKind.SCENE, SpriteKind.SCENE_IN_SIGHT, SpriteKind.ADDITIVE]);
    });

    it('passes on the normal map of a texture that has one', () => {
        const normals = { width: 100, height: 50 } as HTMLImageElement;
        const lit = new Entity('Zombie', new Point(0, 0, 0), new Box(48, 48));
        const material = lit.addComponent(new Material());
        lit.build();
        const texture = new Texture(sheet, new Vector(0, 0), 48, 48);
        texture.normals = normals;
        material.setTexture(texture);
        const batch = queued([sprite(0, 0), lit]);
        expect([batch.data[3], batch.data[FLOATS_PER_SPRITE + 3]]).toEqual([0, 1]);
        expect(batch.run(1).normals).toBe(normals);
    });
});
