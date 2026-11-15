import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function fakeDevice() {
    let markLost : (info : { reason : string; message : string }) => void = () => {};
    const lost = new Promise<{ reason : string; message : string }>((resolve) => {
        markLost = resolve;
    });
    return { lost, isDestroyed: false, addEventListener: () => {}, destroy() { this.isDestroyed = true; }, loseDevice: (reason : string) => markLost({ reason, message: 'gone' }) };
}

function fakeNavigatorGpu() {
    const devices : ReturnType<typeof fakeDevice>[] = [];
    const requestDevice = vi.fn(async () => {
        const device = fakeDevice();
        devices.push(device);
        return device;
    });
    vi.stubGlobal('navigator', {
        gpu: {
            requestAdapter: async () => ({ requestDevice }),
            getPreferredCanvasFormat: () => 'bgra8unorm',
        },
    });
    return { devices, requestDevice };
}

function fakeCanvas() {
    const configure = vi.fn();
    const canvas = { width: 1200, height: 600, getContext: () => ({ configure }) } as unknown as HTMLCanvasElement;
    return { canvas, configure };
}

async function freshModule() {
    vi.resetModules();
    return import('./GpuContext');
}

beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('createGpuContext', () => {
    it('shares one device across games on the page, configuring the canvas for each', async () => {
        const { requestDevice } = fakeNavigatorGpu();
        const { createGpuContext } = await freshModule();
        const first = fakeCanvas(), second = fakeCanvas();
        const firstGame = await createGpuContext(first.canvas);
        const secondGame = await createGpuContext(second.canvas);
        expect(requestDevice).toHaveBeenCalledTimes(1);
        expect(secondGame.device).toBe(firstGame.device);
        expect(first.configure).toHaveBeenCalledWith({ device: firstGame.device, format: 'bgra8unorm', alphaMode: 'opaque' });
        expect(second.configure).toHaveBeenCalledTimes(1);
    });

    it('asks for a new device once the shared one is lost', async () => {
        const { requestDevice, devices } = fakeNavigatorGpu();
        const { createGpuContext } = await freshModule();
        await createGpuContext(fakeCanvas().canvas);
        devices[0].loseDevice('unknown');
        await devices[0].lost;
        const replacement = await createGpuContext(fakeCanvas().canvas);
        expect(requestDevice).toHaveBeenCalledTimes(2);
        expect(replacement.device).toBe(devices[1]);
    });

    it('tries again on the next game when getting a device fails', async () => {
        const { requestDevice } = fakeNavigatorGpu();
        requestDevice.mockRejectedValueOnce(new Error('Failed to create MTLSharedEvent'));
        const { createGpuContext } = await freshModule();
        await expect(createGpuContext(fakeCanvas().canvas)).rejects.toThrow('Restart Chrome');
        await expect(createGpuContext(fakeCanvas().canvas)).resolves.toBeDefined();
        expect(requestDevice).toHaveBeenCalledTimes(2);
    });

    it('explains how to recover when Chrome cannot start a device', async () => {
        const { requestDevice } = fakeNavigatorGpu();
        const chromeError = new Error('Failed to create MTLSharedEvent');
        requestDevice.mockRejectedValueOnce(chromeError);
        const { createGpuContext } = await freshModule();
        await expect(createGpuContext(fakeCanvas().canvas)).rejects.toMatchObject({ message: expect.stringContaining('Restart Chrome'), cause: chromeError });
    });

    it('frees the device when the page goes away, so reloading can make a new one', async () => {
        const { devices } = fakeNavigatorGpu();
        const pageListeners = new Map<string, () => void>();
        vi.stubGlobal('addEventListener', (type : string, listener : () => void) => pageListeners.set(type, listener));
        const { createGpuContext } = await freshModule();
        await createGpuContext(fakeCanvas().canvas);
        expect(devices[0].isDestroyed).toBe(false);
        pageListeners.get('pagehide')?.();
        expect(devices[0].isDestroyed).toBe(true);
    });

    it('explains that WebGPU is required when the browser has none', async () => {
        vi.stubGlobal('navigator', {});
        const { createGpuContext } = await freshModule();
        await expect(createGpuContext(fakeCanvas().canvas)).rejects.toThrow('WebGPU is required');
    });
});
