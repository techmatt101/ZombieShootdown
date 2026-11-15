import { SpriteKind, type SpriteBatch } from './SpriteBatch';
import { Material } from '../components/Material';
import type { Entity } from '../Entity';
import type { Camera } from '../../lib/Camera';
import type { Texture, TextureSource } from '../../lib/Texture';

const SUBPIXEL_SNAP_MARGIN = 1;

export function queueEntitySprites(entities : readonly Entity[], camera : Camera, batch : SpriteBatch) {
    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (!entity.hasActiveComponent(Material) || !camera.isInCurrentView(entity.pos, drawRadius(entity))) continue;
        queueEntity(entity, batch);
    }
    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const texture = entity.components.material?.texture ?? null;
        if (texture === null || texture.emissive === null) continue;
        if (!entity.hasActiveComponent(Material) || !camera.isInCurrentView(entity.pos, drawRadius(entity))) continue;
        queueEmissive(entity, texture, texture.emissive, batch);
    }
}

function queueEmissive(entity : Entity, texture : Texture, emissive : TextureSource, batch : SpriteBatch) {
    const material = entity.getComponent('material');
    const kind = material.isHiddenOutOfSight ? SpriteKind.ADDITIVE_IN_SIGHT : SpriteKind.ADDITIVE;
    placeTexture(entity, texture, emissive, kind, batch);
    batch.tint(1, 1, 1, material.opacity);
}

function drawRadius(entity : Entity) {
    const texture = entity.components.material?.texture ?? null;
    const left = -entity.geometry.width / 2 + (texture?.pos.x ?? 0);
    const top = -entity.geometry.height / 2 + (texture?.pos.y ?? 0);
    const right = left + (texture?.width ?? entity.geometry.width);
    const bottom = top + (texture?.height ?? entity.geometry.height);
    const farthestX = Math.max(Math.abs(left), Math.abs(right));
    const farthestY = Math.max(Math.abs(top), Math.abs(bottom));
    return Math.hypot(farthestX, farthestY) + SUBPIXEL_SNAP_MARGIN;
}

function spriteKindOf(material : Material) {
    if (material.isAdditive) return SpriteKind.ADDITIVE;
    return material.isHiddenOutOfSight ? SpriteKind.SCENE_IN_SIGHT : SpriteKind.SCENE;
}

function queueEntity(entity : Entity, batch : SpriteBatch) {
    const material = entity.getComponent('material');
    const texture = material.texture;
    const { x, y, direction } = entity.pos;
    const halfWidth = entity.geometry.width / 2;
    const halfHeight = entity.geometry.height / 2;
    const kind = spriteKindOf(material);

    if (texture === null) {
        batch.place(null, kind, x, y, direction, -halfWidth, -halfHeight, entity.geometry.width, entity.geometry.height);
        batch.tint(0, 0, 0, material.opacity);
        return;
    }

    placeTexture(entity, texture, texture.img, kind, batch);
    batch.tint(1, 1, 1, material.opacity);
    if (texture.normals !== null) {
        batch.withNormals(texture.normals);
    }
}

function placeTexture(entity : Entity, texture : Texture, source : TextureSource, kind : SpriteKind, batch : SpriteBatch) {
    const { x, y, direction } = entity.pos;
    batch.place(source, kind, x, y, direction,
        texture.pos.x - entity.geometry.width / 2, texture.pos.y - entity.geometry.height / 2, texture.width, texture.height);
    const imageWidth = texture.img.width, imageHeight = texture.img.height;
    batch.crop(
        texture.sourcePos.x / imageWidth,
        texture.sourcePos.y / imageHeight,
        (texture.sourcePos.x + texture.sourceWidth) / imageWidth,
        (texture.sourcePos.y + texture.sourceHeight) / imageHeight
    );
}
