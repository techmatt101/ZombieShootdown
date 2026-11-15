import blurShader from './shaders/blur.wgsl?raw';
import commonShader from './shaders/common.wgsl?raw';
import compositeShader from './shaders/composite.wgsl?raw';
import fanShader from './shaders/fan.wgsl?raw';
import memoryShader from './shaders/memory.wgsl?raw';
import spriteShader from './shaders/sprite.wgsl?raw';

export const LIGHT_TARGET_FORMAT : GPUTextureFormat = 'rgba8unorm';
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
    brightness : GPURenderPipeline;
    glow : GPURenderPipeline;
    memory : GPURenderPipeline;
    blurAcross : GPURenderPipeline;
    blurDown : GPURenderPipeline;
    darken : GPURenderPipeline;
    warmGlow : GPURenderPipeline;
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
    const withTextureAndSoftLight = device.createPipelineLayout({ bindGroupLayouts: [sceneLayout, textureLayout, textureLayout] });
    const sceneOnly = device.createPipelineLayout({ bindGroupLayouts: [sceneLayout] });

    const module = (label : string, code : string) => device.createShaderModule({ label, code: commonShader + code });
    const spriteModule = module('sprite', spriteShader);
    const fanModule = module('fan', fanShader);
    const memoryModule = module('memory', memoryShader);
    const blurModule = module('blur', blurShader);
    const compositeModule = module('composite', compositeShader);

    const sprite = (label : string, entryPoint : string, blend : GPUBlendState, layout = withTexture) => device.createRenderPipeline({
        label,
        layout,
        vertex: { module: spriteModule, entryPoint: 'vertexMain', buffers: [SPRITE_INSTANCE] },
        fragment: { module: spriteModule, entryPoint, targets: [{ format: canvasFormat, blend }] },
    });

    const fan = (label : string, entryPoint : string) => device.createRenderPipeline({
        label,
        layout: sceneOnly,
        vertex: { module: fanModule, entryPoint: 'vertexMain', buffers: [FAN_VERTEX] },
        fragment: { module: fanModule, entryPoint, targets: [{ format: LIGHT_TARGET_FORMAT, blend: ADDITIVE }] },
    });

    const blur = (label : string, blurAxisX : number, blurAxisY : number) => device.createRenderPipeline({
        label,
        layout: withTexture,
        vertex: { module: blurModule, entryPoint: 'vertexMain' },
        fragment: {
            module: blurModule,
            entryPoint: 'fragmentMain',
            targets: [{ format: LIGHT_TARGET_FORMAT }],
            constants: { blurAxisX, blurAxisY },
        },
    });

    const composite = (label : string, entryPoint : string, blend : GPUBlendState) => device.createRenderPipeline({
        label,
        layout: withTexture,
        vertex: { module: compositeModule, entryPoint: 'vertexMain' },
        fragment: { module: compositeModule, entryPoint, targets: [{ format: canvasFormat, blend }] },
    });

    return {
        sceneLayout,
        textureLayout,
        sprite: sprite('sprite', 'fragmentMain', PREMULTIPLIED_ALPHA),
        spriteInSight: sprite('sprite in sight', 'fragmentInSight', PREMULTIPLIED_ALPHA, withTextureAndSoftLight),
        spriteAdditive: sprite('sprite additive', 'fragmentMain', ADDITIVE),
        brightness: fan('brightness', 'brightnessMain'),
        glow: fan('glow', 'glowMain'),
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
        blurAcross: blur('blur across', 1, 0),
        blurDown: blur('blur down', 0, 1),
        darken: composite('darken', 'darkenMain', MULTIPLY),
        warmGlow: composite('warm glow', 'warmGlowMain', ADDITIVE),
    };
}
