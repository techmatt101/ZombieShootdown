import { describe, expect, it } from 'vitest';
import { Camera, MAX_ZOOM, MIN_ZOOM } from './Camera';
import { Vector } from './geometry/Vector';

const SCREEN_CENTRE = { x: 600, y: 300 };

function cameraAt(x : number, y : number, zoom = 1) {
    const camera = new Camera(SCREEN_CENTRE);
    camera.zoom = zoom;
    camera.setTarget(new Vector(x, y));
    camera.jumpToTarget();
    return camera;
}

describe('Camera', () => {
    it('jumps to its target and exposes world view bounds', () => {
        const camera = cameraAt(1000, 500);
        expect(camera.view).toEqual({ left: 400, top: 200, right: 1600, bottom: 800 });
    });

    it('shows more of the world when zoomed out', () => {
        const camera = cameraAt(0, 0, 0.5);
        expect(camera.halfView).toMatchObject({ x: 1200, y: 600 });
        expect(camera.isInCurrentView({ x: 1100, y: 0 })).toBe(true);
        expect(camera.isInCurrentView({ x: 1300, y: 0 })).toBe(false);
    });

    it('treats a margin as extra distance beyond the screen edge', () => {
        const camera = cameraAt(0, 0);
        expect(camera.isInCurrentView({ x: 650, y: 0 })).toBe(false);
        expect(camera.isInCurrentView({ x: 650, y: 0 }, 64)).toBe(true);
    });

    it('also counts the view around the target it is moving towards', () => {
        const camera = cameraAt(0, 0);
        camera.setTarget(new Vector(5000, 0));
        expect(camera.isInCurrentView({ x: 5000, y: 0 })).toBe(false);
        expect(camera.isInCurrentOrUpcomingView({ x: 5000, y: 0 })).toBe(true);
    });

    it('eases towards its target without ever overshooting', () => {
        const camera = cameraAt(0, 0);
        const target = new Vector(500, -2000);
        camera.setTarget(target);
        for (let frame = 0; frame < 50; frame++) {
            camera.update(1);
            expect(camera.pos.x).toBeLessThanOrEqual(500);
            expect(camera.pos.y).toBeGreaterThanOrEqual(-2000);
        }
        expect(camera.pos.x).toBeCloseTo(500, 0);
        expect(camera.pos.y).toBeCloseTo(-2000, 0);
    });

    it('keeps zoom within its limits', () => {
        const camera = cameraAt(0, 0);
        camera.zoomBy(-10);
        expect(camera.zoom).toBe(MIN_ZOOM);
        camera.zoomBy(10);
        expect(camera.zoom).toBe(MAX_ZOOM);
        expect(camera.halfView.x).toBe(SCREEN_CENTRE.x / MAX_ZOOM);
    });

    it('converts screen pixels to world positions, respecting zoom', () => {
        const camera = cameraAt(100, 100, 2);
        const world = camera.screenToWorld({ x: 600, y: 300 }, new Vector(0, 0));
        expect(world).toMatchObject({ x: 100, y: 100 });
        expect(camera.screenToWorld({ x: 0, y: 0 }, new Vector(0, 0))).toMatchObject({ x: -200, y: -50 });
    });

    it('converts world positions to screen pixels, matching how the world is drawn', () => {
        const camera = cameraAt(100, 100, 2);
        expect(camera.worldToScreen({ x: 100, y: 100 }, new Vector(0, 0))).toMatchObject({ x: 600, y: 300 });
        expect(camera.worldToScreen({ x: -200, y: -50 }, new Vector(0, 0))).toMatchObject({ x: 0, y: 0 });
    });
});
