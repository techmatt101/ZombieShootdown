import { describe, expect, it } from 'vitest';
import { SpriteAnimation } from './SpriteAnimation';
import { Vector } from '../../lib/geometry/Vector';
import { Texture } from '../../lib/Texture';

function frame(y : number, time : number) {
    return { x: 0, y, width: 28, height: 20, time };
}

function texture() {
    return new Texture({ width: 28, height: 40 } as unknown as ImageBitmap, new Vector(0, 0), 28, 20);
}

describe('SpriteAnimation', () => {
    it('advances to the frame whose time has been reached, then loops', () => {
        const animation = new SpriteAnimation({ animationTime: 4, spriteSequence: [frame(0, 2), frame(20, 4)] });
        const target = texture();
        animation.update(2.5, target);
        expect(target.sourcePos.y).toBe(20);
        animation.update(2, target);
        expect(target.sourcePos.y).toBe(0);
    });

    it('stays on the last frame when the loop runs longer than its keyframes', () => {
        const animation = new SpriteAnimation({ animationTime: 2, spriteSequence: [frame(0, 0), frame(20, 1)] });
        const target = texture();
        expect(() => animation.update(1.5, target)).not.toThrow();
        expect(target.sourcePos.y).toBe(20);
    });

    it('rests on its last frame when it only plays once, until it is played', () => {
        const animation = new SpriteAnimation({ animationTime: 2, playsOnce: true, spriteSequence: [frame(0, 1), frame(20, 2)] });
        const target = texture();
        target.sourcePos.y = 20;
        animation.update(10, target);
        expect(target.sourcePos.y).toBe(20);
    });

    it('runs through once when played, then holds the last frame instead of looping', () => {
        const animation = new SpriteAnimation({ animationTime: 2, playsOnce: true, spriteSequence: [frame(0, 1), frame(20, 2)] });
        const target = texture();
        animation.play();
        animation.update(0.5, target);
        expect(target.sourcePos.y).toBe(0);
        animation.update(1, target);
        expect(target.sourcePos.y).toBe(20);
        animation.update(10, target);
        expect(target.sourcePos.y).toBe(20);
    });

    it('starts again from the first frame when played mid-way', () => {
        const animation = new SpriteAnimation({ animationTime: 2, playsOnce: true, spriteSequence: [frame(0, 1), frame(20, 2)] });
        const target = texture();
        animation.play();
        animation.update(1.5, target);
        expect(target.sourcePos.y).toBe(20);
        animation.play();
        animation.update(0.1, target);
        expect(target.sourcePos.y).toBe(0);
    });
});
