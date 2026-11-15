import type { GpuContext } from './GpuContext';
import { MaskTextures } from './MaskTextures';
import {
    createPipelines, FAN_VERTEX_STRIDE, LIGHT_TARGET_FORMAT, MEMORY_INSTANCE_STRIDE,
    SPRITE_STRIDE, type PipelineSettings, type Pipelines,
} from './pipelines';
import { TextureStore } from './TextureStore';
import { FLOATS_PER_SPRITE, SpriteKind, type SpriteBatch } from '../SpriteBatch';
import type { Light } from '../../components/Light';
import type { Camera } from '../../../lib/Camera';
import type { TextureSource } from '../../../lib/Texture';
import { fanTriangles, fanVertexCount, FLOATS_PER_FAN_VERTEX } from '../../../lighting/fanTriangles';
import type { LitArea } from '../../../lighting/LightField';
import { MEMORY_SIZE, type RememberedChunk } from '../../../lighting/MapMemory';

export const MAX_LIGHTS = 32;
const CAMERA_FLOATS = 16;
const FLOATS_PER_LIGHT = 8;
const MEMORY_FLOATS_PER_CHUNK = 2;
const BYTES_PER_FLOAT = 4;
const INITIAL_BUFFER_BYTES = 16384;
const QUAD_VERTICES = 6;
const FULLSCREEN_TRIANGLE_VERTICES = 3;
const BLUR_DOWNSCALE = 2;
const SOFT_LIGHT_GROUP = 2;
const MIN_POLYGON_FLOATS = 6;
const BLACK : GPUColor = { r: 0, g: 0, b: 0, a: 1 };
const UNLIT : GPUColor = { r: 0, g: 0, b: 0, a: 0 };

export interface LightingSource {
    readonly lights : readonly Light[];
    readonly version : number;
    litAreaOf(light : Light) : LitArea | undefined;
    rememberedInView(camera : Camera, out : RememberedChunk[]) : void;
}

export interface PainterSettings extends PipelineSettings {
    normalMapStrength : number;
    lightHeight : number;
    nearShadowSoftness : number;
    farShadowSoftness : number;
    softestShadowDistance : number;
}

interface LightTarget {
    texture : GPUTexture;
    view : GPUTextureView;
    asSource : GPUBindGroup;
}

interface RenderTargets {
    width : number;
    height : number;
    blurWidth : number;
    blurHeight : number;
    light : LightTarget;
    blurredAcross : LightTarget;
    softLight : LightTarget;
}

function hasFan(area : LitArea | undefined) : area is LitArea {
    return area !== undefined && area.polygon.length >= MIN_POLYGON_FLOATS;
}

export class GpuPainter {
    #gpu : GpuContext;
    #device : GPUDevice;
    #pipelines : Pipelines;
    #textures : TextureStore;
    #masks : MaskTextures;
    #smoothSampler : GPUSampler;
    #settings : PainterSettings;
    #visionTexture : GPUTexture;
    #cameraBuffer : GPUBuffer;
    #lightBuffer : GPUBuffer;
    #sceneBindGroup : GPUBindGroup;
    #instanceBuffer : GPUBuffer;
    #fanBuffer : GPUBuffer;
    #memoryBuffer : GPUBuffer;
    #targets : RenderTargets | null = null;

    #cameraData = new Float32Array(CAMERA_FLOATS);
    #lightData = new Float32Array(MAX_LIGHTS * FLOATS_PER_LIGHT);
    #lightCount = 0;
    #hasGlow = false;
    #fanData = new Float32Array(INITIAL_BUFFER_BYTES / BYTES_PER_FLOAT);
    #fanFirst = new Uint32Array(MAX_LIGHTS);
    #fanCount = new Uint32Array(MAX_LIGHTS);
    #fanLights : Light[] = [];
    #fanVersion = -1;
    #remembered : RememberedChunk[] = [];
    #memoryData = new Float32Array(INITIAL_BUFFER_BYTES / BYTES_PER_FLOAT);
    #drawCalls = 0;

    constructor(gpu : GpuContext, settings : PainterSettings, vision : TextureSource) {
        this.#gpu = gpu;
        this.#settings = settings;
        const device = gpu.device;
        this.#device = device;
        this.#pipelines = createPipelines(device, gpu.format, settings);

        const nearestSampler = device.createSampler({ label: 'nearest' });
        const smoothSampler = device.createSampler({ label: 'smooth', magFilter: 'linear', minFilter: 'linear' });
        this.#smoothSampler = smoothSampler;
        this.#textures = new TextureStore(device, this.#pipelines.spriteLayout, nearestSampler);
        this.#masks = new MaskTextures(device, this.#pipelines.textureLayout, smoothSampler, MEMORY_SIZE);

        this.#cameraBuffer = this.#createBuffer('camera', CAMERA_FLOATS * BYTES_PER_FLOAT, GPUBufferUsage.UNIFORM);
        this.#lightBuffer = this.#createBuffer('lights', this.#lightData.byteLength, GPUBufferUsage.STORAGE);
        this.#instanceBuffer = this.#createBuffer('sprites', INITIAL_BUFFER_BYTES, GPUBufferUsage.VERTEX);
        this.#fanBuffer = this.#createBuffer('light fans', INITIAL_BUFFER_BYTES, GPUBufferUsage.VERTEX);
        this.#memoryBuffer = this.#createBuffer('memory chunks', INITIAL_BUFFER_BYTES, GPUBufferUsage.VERTEX);

        this.#visionTexture = this.#uploadVision(vision);
        this.#sceneBindGroup = device.createBindGroup({
            label: 'scene',
            layout: this.#pipelines.sceneLayout,
            entries: [
                { binding: 0, resource: { buffer: this.#cameraBuffer } },
                { binding: 1, resource: { buffer: this.#lightBuffer } },
                { binding: 2, resource: this.#visionTexture.createView() },
                { binding: 3, resource: smoothSampler },
            ],
        });
    }

    release(source : TextureSource) {
        this.#textures.release(source);
    }

    dispose() {
        this.#textures.dispose();
        this.#masks.dispose();
        this.#visionTexture.destroy();
        this.#destroyTargets();
        this.#targets = null;
        this.#cameraBuffer.destroy();
        this.#lightBuffer.destroy();
        this.#instanceBuffer.destroy();
        this.#fanBuffer.destroy();
        this.#memoryBuffer.destroy();
        this.#gpu.context.unconfigure();
    }

    paint(batch : SpriteBatch, lighting : LightingSource | null, camera : Camera) {
        this.#drawCalls = 0;
        const targets = this.#resizeTargets();
        if (lighting !== null) {
            this.#writeLights(lighting);
            this.#writeFans(lighting);
            this.#writeRemembered(lighting, camera);
        } else {
            this.#lightCount = 0;
        }
        this.#writeCamera(camera, targets);
        this.#writeSprites(batch);

        const encoder = this.#device.createCommandEncoder();
        if (lighting !== null) {
            this.#paintLight(encoder, targets);
            this.#paintBlur(encoder, this.#pipelines.blurAcross, targets.light, targets.blurredAcross);
            this.#paintBlur(encoder, this.#pipelines.blurDown, targets.blurredAcross, targets.softLight);
        }
        this.#paintScene(encoder, targets, batch, lighting !== null);
        this.#device.queue.submit([encoder.finish()]);
        this.#masks.endFrame();
        return this.#drawCalls;
    }

    #paintLight(encoder : GPUCommandEncoder, targets : RenderTargets) {
        const pass = encoder.beginRenderPass({
            label: 'light',
            colorAttachments: [{ view: targets.light.view, loadOp: 'clear', clearValue: UNLIT, storeOp: 'store' }],
        });
        pass.setBindGroup(0, this.#sceneBindGroup);

        const remembered = this.#remembered;
        if (remembered.length > 0) {
            pass.setPipeline(this.#pipelines.memory);
            pass.setVertexBuffer(0, this.#memoryBuffer);
            for (let i = 0; i < remembered.length; i++) {
                pass.setBindGroup(1, this.#masks.bindGroupFor(remembered[i].mask, remembered[i].version));
                this.#draw(pass, QUAD_VERTICES, 1, 0, i);
            }
        }

        pass.setPipeline(this.#pipelines.brightness);
        pass.setVertexBuffer(0, this.#fanBuffer);
        for (let i = 0; i < this.#lightCount; i++) {
            this.#drawFan(pass, i);
        }
        if (this.#hasGlow) {
            this.#paintGlow(pass);
        }
        pass.end();
    }

    #paintBlur(encoder : GPUCommandEncoder, pipeline : GPURenderPipeline, source : LightTarget, target : LightTarget) {
        const pass = encoder.beginRenderPass({
            label: pipeline.label,
            colorAttachments: [{ view: target.view, loadOp: 'clear', clearValue: UNLIT, storeOp: 'store' }],
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, this.#sceneBindGroup);
        pass.setBindGroup(1, source.asSource);
        this.#draw(pass, FULLSCREEN_TRIANGLE_VERTICES, 1, 0, 0);
        pass.end();
    }

    #paintScene(encoder : GPUCommandEncoder, targets : RenderTargets, batch : SpriteBatch, isLit : boolean) {
        const pass = encoder.beginRenderPass({
            label: 'scene',
            colorAttachments: [{ view: this.#gpu.context.getCurrentTexture().createView(), loadOp: 'clear', clearValue: BLACK, storeOp: 'store' }],
        });
        pass.setBindGroup(0, this.#sceneBindGroup);
        if (isLit) {
            pass.setBindGroup(SOFT_LIGHT_GROUP, targets.softLight.asSource);
        }

        this.#paintSprites(pass, batch, isLit, false);
        if (isLit) {
            pass.setBindGroup(1, targets.softLight.asSource);
            pass.setPipeline(this.#pipelines.darken);
            this.#draw(pass, FULLSCREEN_TRIANGLE_VERTICES, 1, 0, 0);
            if (this.#hasGlow) {
                pass.setPipeline(this.#pipelines.warmGlow);
                this.#draw(pass, FULLSCREEN_TRIANGLE_VERTICES, 1, 0, 0);
            }
        }
        this.#paintSprites(pass, batch, isLit, true);
        pass.end();
    }

    #paintGlow(pass : GPURenderPassEncoder) {
        pass.setPipeline(this.#pipelines.glow);
        const lights = this.#fanLights;
        for (let i = 0; i < this.#lightCount; i++) {
            if (lights[i].glow > 0) {
                this.#drawFan(pass, i);
            }
        }
    }

    #paintSprites(pass : GPURenderPassEncoder, batch : SpriteBatch, isLit : boolean, isAdditivePass : boolean) {
        pass.setVertexBuffer(0, this.#instanceBuffer);
        let current : GPURenderPipeline | null = null;
        for (let i = 0; i < batch.runCount; i++) {
            const run = batch.run(i);
            const isAdditive = run.kind === SpriteKind.ADDITIVE;
            if (isAdditive !== isAdditivePass) continue;
            const pipeline = this.#spritePipeline(run.kind, isLit);
            if (pipeline !== current) {
                pass.setPipeline(pipeline);
                current = pipeline;
            }
            pass.setBindGroup(1, this.#textures.bindGroupFor(run.source, run.normals));
            this.#draw(pass, QUAD_VERTICES, run.count, 0, run.first);
        }
    }

    #spritePipeline(kind : SpriteKind, isLit : boolean) {
        if (kind === SpriteKind.ADDITIVE) return this.#pipelines.spriteAdditive;
        return kind === SpriteKind.SCENE_IN_SIGHT && isLit ? this.#pipelines.spriteInSight : this.#pipelines.sprite;
    }

    #drawFan(pass : GPURenderPassEncoder, lightIndex : number) {
        const vertexCount = this.#fanCount[lightIndex];
        if (vertexCount > 0) {
            this.#draw(pass, vertexCount, 1, this.#fanFirst[lightIndex], lightIndex);
        }
    }

    #draw(pass : GPURenderPassEncoder, vertexCount : number, instanceCount : number, firstVertex : number, firstInstance : number) {
        pass.draw(vertexCount, instanceCount, firstVertex, firstInstance);
        this.#drawCalls++;
    }

    #writeCamera(camera : Camera, targets : RenderTargets) {
        const data = this.#cameraData;
        data[0] = Math.trunc(camera.view.left);
        data[1] = Math.trunc(camera.view.top);
        data[2] = camera.zoom;
        data[3] = this.#settings.softestShadowDistance;
        data[4] = targets.width;
        data[5] = targets.height;
        data[6] = targets.blurWidth;
        data[7] = targets.blurHeight;
        const player = camera.target ?? camera.pos;
        data[8] = player.x;
        data[9] = player.y;
        data[10] = this.#settings.nearShadowSoftness * camera.zoom;
        data[11] = this.#settings.farShadowSoftness * camera.zoom;
        data[12] = this.#lightCount;
        data[13] = this.#settings.normalMapStrength;
        data[14] = this.#settings.lightHeight;
        this.#device.queue.writeBuffer(this.#cameraBuffer, 0, data);
    }

    #writeSprites(batch : SpriteBatch) {
        const floats = batch.count * FLOATS_PER_SPRITE;
        if (floats === 0) return;
        this.#instanceBuffer = this.#bufferFitting(this.#instanceBuffer, batch.count * SPRITE_STRIDE);
        this.#device.queue.writeBuffer(this.#instanceBuffer, 0, batch.data, 0, floats);
    }

    #writeLights(lighting : LightingSource) {
        const lights = lighting.lights;
        const count = Math.min(lights.length, MAX_LIGHTS);
        const data = this.#lightData;
        let hasGlow = false;
        for (let i = 0; i < count; i++) {
            const light = lights[i];
            const offset = i * FLOATS_PER_LIGHT;
            data[offset] = light.pos.x;
            data[offset + 1] = light.pos.y;
            data[offset + 2] = light.radius;
            data[offset + 3] = light.intensity;
            data[offset + 4] = light.glow;
            data[offset + 5] = light.isSight ? 1 : 0;
            hasGlow ||= light.glow > 0;
        }
        this.#lightCount = count;
        this.#hasGlow = hasGlow;
        if (count > 0) {
            this.#device.queue.writeBuffer(this.#lightBuffer, 0, data, 0, count * FLOATS_PER_LIGHT);
        }
    }

    #writeFans(lighting : LightingSource) {
        if (this.#fansAreCurrent(lighting)) return;
        const lights = lighting.lights;
        const count = this.#lightCount;

        let floats = 0;
        for (let i = 0; i < count; i++) {
            const area = lighting.litAreaOf(lights[i]);
            if (hasFan(area)) {
                floats += fanVertexCount(area.polygon) * FLOATS_PER_FAN_VERTEX;
            }
        }
        if (floats > this.#fanData.length) {
            this.#fanData = new Float32Array(Math.max(floats, this.#fanData.length * 2));
        }

        let offset = 0;
        for (let i = 0; i < count; i++) {
            const area = lighting.litAreaOf(lights[i]);
            const firstVertex = offset / FLOATS_PER_FAN_VERTEX;
            if (hasFan(area)) {
                offset = fanTriangles(area.x, area.y, area.polygon, this.#fanData, offset);
            }
            this.#fanFirst[i] = firstVertex;
            this.#fanCount[i] = offset / FLOATS_PER_FAN_VERTEX - firstVertex;
        }
        if (offset > 0) {
            this.#fanBuffer = this.#bufferFitting(this.#fanBuffer, (offset / FLOATS_PER_FAN_VERTEX) * FAN_VERTEX_STRIDE);
            this.#device.queue.writeBuffer(this.#fanBuffer, 0, this.#fanData, 0, offset);
        }

        this.#fanVersion = lighting.version;
        const fanLights = this.#fanLights;
        fanLights.length = 0;
        for (let i = 0; i < count; i++) {
            fanLights.push(lights[i]);
        }
    }

    #fansAreCurrent(lighting : LightingSource) {
        if (lighting.version !== this.#fanVersion) return false;
        const lights = lighting.lights, previous = this.#fanLights;
        if (Math.min(lights.length, MAX_LIGHTS) !== previous.length) return false;
        for (let i = 0; i < previous.length; i++) {
            if (lights[i] !== previous[i]) return false;
        }
        return true;
    }

    #writeRemembered(lighting : LightingSource, camera : Camera) {
        const remembered = this.#remembered;
        lighting.rememberedInView(camera, remembered);
        const floats = remembered.length * MEMORY_FLOATS_PER_CHUNK;
        if (floats === 0) return;
        if (floats > this.#memoryData.length) {
            this.#memoryData = new Float32Array(floats * 2);
        }
        const data = this.#memoryData;
        for (let i = 0; i < remembered.length; i++) {
            data[i * MEMORY_FLOATS_PER_CHUNK] = remembered[i].left;
            data[i * MEMORY_FLOATS_PER_CHUNK + 1] = remembered[i].top;
        }
        this.#memoryBuffer = this.#bufferFitting(this.#memoryBuffer, remembered.length * MEMORY_INSTANCE_STRIDE);
        this.#device.queue.writeBuffer(this.#memoryBuffer, 0, data, 0, floats);
    }

    #resizeTargets() : RenderTargets {
        const { width, height } = this.#gpu.canvas;
        const current = this.#targets;
        if (current !== null && current.width === width && current.height === height) {
            return current;
        }
        this.#destroyTargets();
        const blurWidth = Math.max(1, Math.ceil(width / BLUR_DOWNSCALE));
        const blurHeight = Math.max(1, Math.ceil(height / BLUR_DOWNSCALE));
        const targets = {
            width,
            height,
            blurWidth,
            blurHeight,
            light: this.#createLightTarget('light', width, height),
            blurredAcross: this.#createLightTarget('shadow blur', blurWidth, blurHeight),
            softLight: this.#createLightTarget('soft light', blurWidth, blurHeight),
        };
        this.#targets = targets;
        return targets;
    }

    #createLightTarget(label : string, width : number, height : number) : LightTarget {
        const texture = this.#device.createTexture({
            label,
            size: [width, height],
            format: LIGHT_TARGET_FORMAT,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        });
        const view = texture.createView();
        const asSource = this.#device.createBindGroup({
            label,
            layout: this.#pipelines.textureLayout,
            entries: [
                { binding: 0, resource: view },
                { binding: 1, resource: this.#smoothSampler },
            ],
        });
        return { texture, view, asSource };
    }

    #destroyTargets() {
        const targets = this.#targets;
        if (targets === null) return;
        targets.light.texture.destroy();
        targets.blurredAcross.texture.destroy();
        targets.softLight.texture.destroy();
    }

    #uploadVision(vision : TextureSource) {
        const size = [vision.width, vision.height];
        const texture = this.#device.createTexture({
            label: 'vision',
            size,
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.#device.queue.copyExternalImageToTexture({ source: vision }, { texture }, size);
        return texture;
    }

    #createBuffer(label : string, size : number, usage : number) {
        return this.#device.createBuffer({ label, size, usage: usage | GPUBufferUsage.COPY_DST });
    }

    #bufferFitting(buffer : GPUBuffer, bytes : number) {
        if (bytes <= buffer.size) return buffer;
        const label = buffer.label;
        const usage = buffer.usage;
        buffer.destroy();
        return this.#device.createBuffer({ label, size: Math.max(bytes, buffer.size * 2), usage });
    }
}
