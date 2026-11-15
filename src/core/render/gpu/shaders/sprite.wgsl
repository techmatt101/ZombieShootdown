@group(1) @binding(0) var spriteTexture : texture_2d<f32>;
@group(1) @binding(1) var spriteSampler : sampler;
@group(1) @binding(2) var normalTexture : texture_2d<f32>;
@group(2) @binding(0) var softLightTexture : texture_2d<f32>;
@group(2) @binding(2) var softSampler : sampler;

struct SpriteVertex {
    @builtin(position) position : vec4f,
    @location(0) uv : vec2f,
    @location(1) tint : vec4f,
    @location(2) world : vec2f,
    @location(3) @interpolate(flat) turn : vec2f,
    @location(4) @interpolate(flat) isNormalMapped : f32,
};

@vertex
fn vertexMain(
    @builtin(vertex_index) vertexIndex : u32,
    @location(0) placement : vec4f,
    @location(1) rect : vec4f,
    @location(2) crop : vec4f,
    @location(3) tint : vec4f,
) -> SpriteVertex {
    let corner = quadCorner(vertexIndex);
    let local = rect.xy + corner * rect.zw;
    let cosine = cos(placement.z);
    let sine = sin(placement.z);
    let world = placement.xy + vec2f(local.x * cosine - local.y * sine, local.x * sine + local.y * cosine);
    var out : SpriteVertex;
    out.position = worldToClip(world);
    out.uv = mix(crop.xy, crop.zw, corner);
    out.tint = vec4f(tint.rgb * tint.a, tint.a);
    out.world = world;
    out.turn = vec2f(cosine, sine);
    out.isNormalMapped = placement.w;
    return out;
}

const NO_LIGHT = 0.0001;

fn normalShade(in : SpriteVertex) -> vec3f {
    if (in.isNormalMapped == 0.0) {
        return vec3f(1.0);
    }
    let encoded = textureSampleLevel(normalTexture, spriteSampler, in.uv, 0.0).xyz * 2.0 - 1.0;
    let pointingDown = -encoded.y;
    let normal = normalize(vec3f(
        encoded.x * in.turn.x - pointingDown * in.turn.y,
        encoded.x * in.turn.y + pointingDown * in.turn.x,
        encoded.z,
    ));
    let lightCount = u32(camera.lighting.x);
    let normalStrength = camera.lighting.y;
    let lightHeight = camera.lighting.z;
    var shaded = vec3f(0.0);
    var unshaded = vec3f(0.0);
    for (var i = 0u; i < lightCount; i++) {
        let light = lights[i];
        let arriving = light.colour * reachOf(light, in.world);
        let towards = normalize(vec3f(light.centre - in.world, lightHeight));
        let facing = max(0.0, 1.0 + normalStrength * (dot(normal, towards) - towards.z));
        shaded += arriving * facing;
        unshaded += arriving;
    }
    return select(shaded / max(unshaded, vec3f(NO_LIGHT)), vec3f(1.0), unshaded < vec3f(NO_LIGHT));
}

fn shadedSprite(in : SpriteVertex) -> vec4f {
    let colour = textureSample(spriteTexture, spriteSampler, in.uv) * in.tint;
    return vec4f(colour.rgb * normalShade(in), colour.a);
}

@fragment
fn fragmentMain(in : SpriteVertex) -> @location(0) vec4f {
    return shadedSprite(in);
}

@fragment
fn fragmentInSight(in : SpriteVertex) -> @location(0) vec4f {
    let sight = saturate(textureSample(softLightTexture, softSampler, in.position.xy / camera.viewport.xy).a);
    return shadedSprite(in) * sight;
}
