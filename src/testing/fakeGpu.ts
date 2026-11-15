import { vi } from 'vitest';
import type { GpuContext } from '../core/render/gpu/GpuContext';

export interface RecordedDraw {
    pass : string;
    pipeline : string;
    vertexCount : number;
    instanceCount : number;
    firstVertex : number;
    firstInstance : number;
    stencilReference : number;
    hasStencil : boolean;
}

export interface RecordedWrite {
    method : string;
    target : string;
    data : number[];
    isPremultiplied? : boolean;
}

export class FakeGpuTexture {
    label : string;
    size : readonly number[];
    format : GPUTextureFormat | undefined;
    isDestroyed = false;

    constructor(label : string, size : readonly number[] = [], format? : GPUTextureFormat) {
        this.label = label;
        this.size = size;
        this.format = format;
    }

    createView() {
        return { texture: this };
    }

    destroy() {
        this.isDestroyed = true;
    }
}

class FakeGpuBuffer {
    label : string;
    size : number;
    usage : number;
    isDestroyed = false;

    constructor(label : string, size : number, usage : number) {
        this.label = label;
        this.size = size;
        this.usage = usage;
    }

    destroy() {
        this.isDestroyed = true;
    }
}

export function stubGpuGlobals() {
    vi.stubGlobal('GPUBufferUsage', { MAP_READ: 1, MAP_WRITE: 2, COPY_SRC: 4, COPY_DST: 8, INDEX: 16, VERTEX: 32, UNIFORM: 64, STORAGE: 128 });
    vi.stubGlobal('GPUTextureUsage', { COPY_SRC: 1, COPY_DST: 2, TEXTURE_BINDING: 4, STORAGE_BINDING: 8, RENDER_ATTACHMENT: 16 });
    vi.stubGlobal('GPUShaderStage', { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 });
}

export function fakeGpu(canvas = { width: 1200, height: 600 }) {
    const draws : RecordedDraw[] = [];
    const writes : RecordedWrite[] = [];
    const textures : FakeGpuTexture[] = [];
    const pipelines : GPURenderPipelineDescriptor[] = [];
    let isUnconfigured = false;

    const labelOf = (target : unknown) => {
        const label = (target as { label? : string } | undefined)?.label;
        return label ?? (target as { texture? : { label : string } } | undefined)?.texture?.label ?? '';
    };

    const beginRenderPass = (descriptor : GPURenderPassDescriptor) => {
        const pass = descriptor.label ?? '';
        const hasStencil = descriptor.depthStencilAttachment !== undefined;
        let pipeline = '';
        let stencilReference = 0;
        return {
            setPipeline: (renderPipeline : { label : string }) => {
                pipeline = renderPipeline.label;
            },
            setStencilReference: (reference : number) => {
                stencilReference = reference;
            },
            setBindGroup: () => {},
            setVertexBuffer: () => {},
            draw: (vertexCount : number, instanceCount = 1, firstVertex = 0, firstInstance = 0) => {
                draws.push({ pass, pipeline, vertexCount, instanceCount, firstVertex, firstInstance, stencilReference, hasStencil });
            },
            end: () => {},
        };
    };

    const device = {
        createBuffer: (descriptor : GPUBufferDescriptor) => new FakeGpuBuffer(descriptor.label ?? '', descriptor.size, descriptor.usage),
        createTexture: (descriptor : GPUTextureDescriptor) => {
            const texture = new FakeGpuTexture(descriptor.label ?? '', [...(descriptor.size as Iterable<number>)], descriptor.format);
            textures.push(texture);
            return texture;
        },
        createSampler: () => ({}),
        createShaderModule: (descriptor : GPUShaderModuleDescriptor) => ({ label: descriptor.label }),
        createBindGroupLayout: () => ({}),
        createPipelineLayout: () => ({}),
        createRenderPipeline: (descriptor : GPURenderPipelineDescriptor) => {
            pipelines.push(descriptor);
            return { label: descriptor.label };
        },
        createBindGroup: (descriptor : GPUBindGroupDescriptor) => ({ label: descriptor.label }),
        createCommandEncoder: () => ({ beginRenderPass, finish: () => ({}) }),
        queue: {
            writeBuffer: (buffer : unknown, offset : number, data : Float32Array, dataOffset = 0, size = data.length - dataOffset) => {
                writes.push({ method: 'writeBuffer', target: labelOf(buffer), data: [...data.subarray(dataOffset, dataOffset + size)] });
            },
            writeTexture: (destination : { texture : unknown }) => writes.push({ method: 'writeTexture', target: labelOf(destination.texture), data: [] }),
            copyExternalImageToTexture: (source : unknown, destination : { texture : unknown; premultipliedAlpha? : boolean }) => {
                writes.push({ method: 'copyExternalImageToTexture', target: labelOf(destination.texture), data: [], isPremultiplied: destination.premultipliedAlpha ?? false });
            },
            submit: () => {},
        },
    };

    const context = {
        getCurrentTexture: () => new FakeGpuTexture('swapchain'),
        unconfigure: () => {
            isUnconfigured = true;
        },
    };

    const gpu = { device, context, format: 'bgra8unorm', canvas } as unknown as GpuContext;
    const pipelinesDrawn = () => draws.map((draw) => draw.pipeline);
    const writesTo = (target : string) => writes.filter((write) => write.target === target).length;
    const uploadsTo = (target : string) => writes.filter((write) => write.target === target && write.method === 'copyExternalImageToTexture');
    const lastWriteTo = (target : string) => writes.filter((write) => write.target === target).at(-1)?.data ?? [];

    return {
        gpu,
        draws,
        writes,
        textures,
        pipelines,
        pipelinesDrawn,
        writesTo,
        lastWriteTo,
        uploadsTo,
        get isUnconfigured() {
            return isUnconfigured;
        },
    };
}
