import commonShader from './shaders/common.wgsl?raw';
import fanShader from './shaders/fan.wgsl?raw';
import memoryShader from './shaders/memory.wgsl?raw';
import multiplyShader from './shaders/multiply.wgsl?raw';
import spriteShader from './shaders/sprite.wgsl?raw';

export const LIGHT_TARGET_FORMAT : GPUTextureFormat = 'r8unorm';
export const STENCIL_FORMAT : GPUTextureFormat = 'stencil8';
export const SPRITE_STRIDE = 64;
export const FAN_VERTEX_STRIDE = 8;
export const MEMORY_INSTANCE_STRIDE = 8;

export interface PipelineSettings {
    chunkSize : number;
    rememberedBrightness : number;
}

export interface Pipelines {
    sceneLayout : GPUBindGroupLayout;
    textureLayout : GPUBindGroupLayout;
    sprite : GPURenderPipeline;
    spriteInSight : GPURenderPipeline;
    spriteAdditive : GPURenderPipeline;
    sightStencil : GPURenderPipeline;
    brightness : GPURenderPipeline;
    glow : GPURenderPipeline;
    memory : GPURenderPipeline;
    multiply : GPURenderPipeline;
}

const PREMULTIPLIED_ALPHA : GPUBlendState = {
    color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
    alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
};

const ADDITIVE : GPUBlendState = {
    color: { srcFactor: 'one', dstFactor: 'one' },
    alpha: { srcFactor: 'one', dstFactor: 'one' },
};

const MULTIPLY : GPUBlendState = {
    color: { srcFactor: 'zero', dstFactor: 'src' },
    alpha: { srcFactor: 'zero', dstFactor: 'one' },
};

const IGNORE_STENCIL : GPUDepthStencilState = { format: STENCIL_FORMAT };

const WRITE_STENCIL : GPUDepthStencilState = {
    format: STENCIL_FORMAT,
    stencilFront: { compare: 'always', passOp: 'replace' },
    stencilBack: { compare: 'always', passOp: 'replace' },
};

const INSIDE_STENCIL : GPUDepthStencilState = {
    format: STENCIL_FORMAT,
    stencilFront: { compare: 'equal', passOp: 'keep' },
    stencilBack: { compare: 'equal', passOp: 'keep' },
    stencilWriteMask: 0,
};

const SPRITE_INSTANCE : GPUVertexBufferLayout = {
    arrayStride: SPRITE_STRIDE,
    stepMode: 'instance',
    attributes: [
        { shaderLocation: 0, offset: 0, format: 'float32x4' },
        { shaderLocation: 1, offset: 16, format: 'float32x4' },
        { shaderLocation: 2, offset: 32, format: 'float32x4' },
        { shaderLocation: 3, offset: 48, format: 'float32x4' },
    ],
};

const FAN_VERTEX : GPUVertexBufferLayout = {
    arrayStride: FAN_VERTEX_STRIDE,
    attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
};

const MEMORY_INSTANCE : GPUVertexBufferLayout = {
    arrayStride: MEMORY_INSTANCE_STRIDE,
    stepMode: 'instance',
    attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
};

export function createPipelines(device : GPUDevice, canvasFormat : GPUTextureFormat, settings : PipelineSettings) : Pipelines {
    const everyStage = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
    const sceneLayout = device.createBindGroupLayout({
        label: 'scene',
        entries: [
            { binding: 0, visibility: everyStage, buffer: { type: 'uniform' } },
            { binding: 1, visibility: everyStage, buffer: { type: 'read-only-storage' } },
            { binding: 2, visibility: everyStage, texture: {} },
            { binding: 3, visibility: everyStage, sampler: {} },
        ],
    });
    const textureLayout = device.createBindGroupLayout({
        label: 'texture',
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
        ],
    });
    const withTexture = device.createPipelineLayout({ bindGroupLayouts: [sceneLayout, textureLayout] });
    const sceneOnly = device.createPipelineLayout({ bindGroupLayouts: [sceneLayout] });

    const module = (label : string, code : string) => device.createShaderModule({ label, code: commonShader + code });
    const spriteModule = module('sprite', spriteShader);
    const fanModule = module('fan', fanShader);
    const memoryModule = module('memory', memoryShader);
    const multiplyModule = module('multiply', multiplyShader);

    const sprite = (label : string, blend : GPUBlendState, depthStencil : GPUDepthStencilState) => device.createRenderPipeline({
        label,
        layout: withTexture,
        vertex: { module: spriteModule, entryPoint: 'vertexMain', buffers: [SPRITE_INSTANCE] },
        fragment: { module: spriteModule, entryPoint: 'fragmentMain', targets: [{ format: canvasFormat, blend }] },
        depthStencil,
    });

    const fan = (label : string, entryPoint : string, target : GPUColorTargetState, depthStencil? : GPUDepthStencilState) => device.createRenderPipeline({
        label,
        layout: sceneOnly,
        vertex: { module: fanModule, entryPoint: 'vertexMain', buffers: [FAN_VERTEX] },
        fragment: { module: fanModule, entryPoint, targets: [target] },
        depthStencil,
    });

    return {
        sceneLayout,
        textureLayout,
        sprite: sprite('sprite', PREMULTIPLIED_ALPHA, IGNORE_STENCIL),
        spriteInSight: sprite('sprite in sight', PREMULTIPLIED_ALPHA, INSIDE_STENCIL),
        spriteAdditive: sprite('sprite additive', ADDITIVE, IGNORE_STENCIL),
        sightStencil: fan('sight stencil', 'stencilMain', { format: canvasFormat, writeMask: 0 }, WRITE_STENCIL),
        brightness: fan('brightness', 'brightnessMain', { format: LIGHT_TARGET_FORMAT, blend: ADDITIVE }),
        glow: fan('glow', 'glowMain', { format: canvasFormat, blend: ADDITIVE }, IGNORE_STENCIL),
        memory: device.createRenderPipeline({
            label: 'memory',
            layout: withTexture,
            vertex: {
                module: memoryModule,
                entryPoint: 'vertexMain',
                buffers: [MEMORY_INSTANCE],
                constants: { chunkSize: settings.chunkSize },
            },
            fragment: {
                module: memoryModule,
                entryPoint: 'fragmentMain',
                targets: [{ format: LIGHT_TARGET_FORMAT, blend: ADDITIVE }],
                constants: { rememberedBrightness: settings.rememberedBrightness },
            },
        }),
        multiply: device.createRenderPipeline({
            label: 'multiply',
            layout: withTexture,
            vertex: { module: multiplyModule, entryPoint: 'vertexMain' },
            fragment: { module: multiplyModule, entryPoint: 'fragmentMain', targets: [{ format: canvasFormat, blend: MULTIPLY }] },
            depthStencil: IGNORE_STENCIL,
        }),
    };
}
