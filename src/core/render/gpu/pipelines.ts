import blurShader from './shaders/blur.wgsl?raw';
import commonShader from './shaders/common.wgsl?raw';
import compositeShader from './shaders/composite.wgsl?raw';
import fanShader from './shaders/fan.wgsl?raw';
import memoryShader from './shaders/memory.wgsl?raw';
import spriteShader from './shaders/sprite.wgsl?raw';

export const LIGHT_TARGET_FORMAT : GPUTextureFormat = 'rgba16float';
export const SHADOW_STENCIL_FORMAT : GPUTextureFormat = 'stencil8';
export const SPRITE_STRIDE = 64;
export const FAN_VERTEX_STRIDE = 8;
export const MEMORY_INSTANCE_STRIDE = 8;

export interface PipelineSettings {
    chunkSize : number;
    rememberedBrightness : number;
    outOfViewLighting : number;
    exposure : number;
    contrast : number;
    brightestLighting : number;
}

export interface Pipelines {
    sceneLayout : GPUBindGroupLayout;
    textureLayout : GPUBindGroupLayout;
    spriteLayout : GPUBindGroupLayout;
    lightPairLayout : GPUBindGroupLayout;
    sprite : GPURenderPipeline;
    spriteInSight : GPURenderPipeline;
    spriteAdditive : GPURenderPipeline;
    shadow : GPURenderPipeline;
    brightness : GPURenderPipeline;
    glow : GPURenderPipeline;
    memory : GPURenderPipeline;
    blurAcross : GPURenderPipeline;
    blurDown : GPURenderPipeline;
    shade : GPURenderPipeline;
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

export const DOUBLED_MULTIPLY : GPUBlendState = {
    color: { srcFactor: 'dst', dstFactor: 'src' },
    alpha: { srcFactor: 'zero', dstFactor: 'one' },
};

const IGNORES_SHADOWS : GPUDepthStencilState = { format: SHADOW_STENCIL_FORMAT };

const MARKS_SHADOW : GPUStencilFaceState = { compare: 'always', passOp: 'replace' };
const CASTS_SHADOW : GPUDepthStencilState = { format: SHADOW_STENCIL_FORMAT, stencilFront: MARKS_SHADOW, stencilBack: MARKS_SHADOW };

const OUTSIDE_SHADOW : GPUStencilFaceState = { compare: 'not-equal', passOp: 'keep' };
const STOPPED_BY_SHADOWS : GPUDepthStencilState = { format: SHADOW_STENCIL_FORMAT, stencilFront: OUTSIDE_SHADOW, stencilBack: OUTSIDE_SHADOW };

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
    const spriteLayout = device.createBindGroupLayout({
        label: 'sprite',
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
            { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {} },
        ],
    });
    const lightPairLayout = device.createBindGroupLayout({
        label: 'light pair',
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
            { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
        ],
    });
    const withTexture = device.createPipelineLayout({ bindGroupLayouts: [sceneLayout, textureLayout] });
    const withLightPair = device.createPipelineLayout({ bindGroupLayouts: [sceneLayout, lightPairLayout] });
    const withSprite = device.createPipelineLayout({ bindGroupLayouts: [sceneLayout, spriteLayout] });
    const withSpriteAndSoftLight = device.createPipelineLayout({ bindGroupLayouts: [sceneLayout, spriteLayout, lightPairLayout] });
    const addedLightAndGlow : GPUColorTargetState[] = [
        { format: LIGHT_TARGET_FORMAT, blend: ADDITIVE },
        { format: LIGHT_TARGET_FORMAT, blend: ADDITIVE },
    ];
    const lightAndGlow : GPUColorTargetState[] = [{ format: LIGHT_TARGET_FORMAT }, { format: LIGHT_TARGET_FORMAT }];
    const noColour : GPUColorTargetState[] = [
        { format: LIGHT_TARGET_FORMAT, writeMask: 0 },
        { format: LIGHT_TARGET_FORMAT, writeMask: 0 },
    ];
    const sceneOnly = device.createPipelineLayout({ bindGroupLayouts: [sceneLayout] });

    const module = (label : string, code : string) => device.createShaderModule({ label, code: commonShader + code });
    const spriteModule = module('sprite', spriteShader);
    const fanModule = module('fan', fanShader);
    const memoryModule = module('memory', memoryShader);
    const blurModule = module('blur', blurShader);
    const compositeModule = module('composite', compositeShader);

    const sprite = (label : string, entryPoint : string, blend : GPUBlendState, layout = withSprite) => device.createRenderPipeline({
        label,
        layout,
        vertex: { module: spriteModule, entryPoint: 'vertexMain', buffers: [SPRITE_INSTANCE] },
        fragment: { module: spriteModule, entryPoint, targets: [{ format: canvasFormat, blend }] },
    });

    const fan = (label : string, entryPoint : string, depthStencil : GPUDepthStencilState, targets = addedLightAndGlow) => device.createRenderPipeline({
        label,
        layout: sceneOnly,
        vertex: { module: fanModule, entryPoint: 'vertexMain', buffers: [FAN_VERTEX] },
        fragment: { module: fanModule, entryPoint, targets },
        depthStencil,
    });

    const blur = (label : string, blurAxisX : number, blurAxisY : number) => device.createRenderPipeline({
        label,
        layout: withLightPair,
        vertex: { module: blurModule, entryPoint: 'vertexMain' },
        fragment: {
            module: blurModule,
            entryPoint: 'fragmentMain',
            targets: lightAndGlow,
            constants: { blurAxisX, blurAxisY },
        },
    });

    const composite = (label : string, entryPoint : string, blend : GPUBlendState, constants : Record<string, number>) => device.createRenderPipeline({
        label,
        layout: withLightPair,
        vertex: { module: compositeModule, entryPoint: 'vertexMain' },
        fragment: { module: compositeModule, entryPoint, targets: [{ format: canvasFormat, blend }], constants },
    });

    return {
        sceneLayout,
        textureLayout,
        spriteLayout,
        lightPairLayout,
        sprite: sprite('sprite', 'fragmentMain', PREMULTIPLIED_ALPHA),
        spriteInSight: sprite('sprite in sight', 'fragmentInSight', PREMULTIPLIED_ALPHA, withSpriteAndSoftLight),
        spriteAdditive: sprite('sprite additive', 'fragmentMain', ADDITIVE),
        shadow: fan('shadow', 'shadowMain', CASTS_SHADOW, noColour),
        brightness: fan('brightness', 'brightnessMain', STOPPED_BY_SHADOWS),
        glow: fan('glow', 'glowMain', IGNORES_SHADOWS),
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
                targets: addedLightAndGlow,
            },
            depthStencil: IGNORES_SHADOWS,
        }),
        blurAcross: blur('blur across', 1, 0),
        blurDown: blur('blur down', 0, 1),
        shade: composite('shade', 'shadeMain', DOUBLED_MULTIPLY, {
            rememberedBrightness: settings.rememberedBrightness,
            outOfViewLighting: settings.outOfViewLighting,
            exposure: settings.exposure,
            contrast: settings.contrast,
            brightestLighting: settings.brightestLighting,
        }),
        warmGlow: composite('warm glow', 'warmGlowMain', ADDITIVE, {
            outOfViewLighting: settings.outOfViewLighting,
            contrast: settings.contrast,
        }),
    };
}
