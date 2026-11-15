export interface GpuContext {
    device : GPUDevice;
    context : GPUCanvasContext;
    format : GPUTextureFormat;
    canvas : { readonly width : number; readonly height : number };
}

let sharedDevice : Promise<GPUDevice> | null = null;

async function requestDevice() : Promise<GPUDevice> {
    if (navigator.gpu === undefined) {
        throw new Error('WebGPU is required');
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter === null) {
        throw new Error('WebGPU is required, but no GPU adapter is available');
    }
    const device = await adapter.requestDevice();
    device.addEventListener('uncapturederror', (e) => console.error('WebGPU error:', e.error.message));
    void device.lost.then((info) => {
        sharedDevice = null;
        if (info.reason !== 'destroyed') {
            console.error('WebGPU device lost:', info.message);
        }
    });
    return device;
}

function deviceForPage() {
    sharedDevice ??= requestDevice().catch((error : unknown) => {
        sharedDevice = null;
        throw error;
    });
    return sharedDevice;
}

export async function createGpuContext(canvas : HTMLCanvasElement) : Promise<GpuContext> {
    const device = await deviceForPage();
    const context = canvas.getContext('webgpu');
    if (context === null) {
        throw new Error('WebGPU canvas context is not supported');
    }
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: 'opaque' });
    return { device, context, format, canvas };
}
