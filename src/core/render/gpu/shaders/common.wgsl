struct Camera {
    view : vec4f,
    viewport : vec4f,
    shadow : vec4f,
    lighting : vec4f,
};

struct Light {
    centre : vec2f,
    radius : f32,
    intensity : f32,
    colour : vec3f,
    glow : f32,
    glowColour : vec3f,
    isSight : f32,
    cone : vec4f,
    fade : f32,
};

struct LightOutput {
    @location(0) light : vec4f,
    @location(1) glow : vec4f,
};

const NOT_A_CONE = -1.0;
const AT_THE_LIGHT = 0.001;

fn coneOf(light : Light, world : vec2f) -> f32 {
    if (light.cone.z < NOT_A_CONE) {
        return 1.0;
    }
    let offset = world - light.centre;
    let distanceAway = length(offset);
    if (distanceAway < AT_THE_LIGHT) {
        return 1.0;
    }
    return smoothstep(light.cone.z, light.cone.w, dot(light.cone.xy, offset / distanceAway));
}

fn reachOf(light : Light, world : vec2f) -> f32 {
    let falloffUv = (world - light.centre) / (2.0 * light.radius) + 0.5;
    let falloff = pow(textureSampleLevel(visionTexture, smoothSampler, falloffUv, 0.0).a, light.fade);
    return falloff * light.intensity * coneOf(light, world);
}

@group(0) @binding(0) var<uniform> camera : Camera;
@group(0) @binding(1) var<storage, read> lights : array<Light>;
@group(0) @binding(2) var visionTexture : texture_2d<f32>;
@group(0) @binding(3) var smoothSampler : sampler;

fn worldToClip(world : vec2f) -> vec4f {
    let screen = (world - camera.view.xy) * camera.view.z;
    let normalised = screen / camera.viewport.xy;
    return vec4f(normalised.x * 2.0 - 1.0, 1.0 - normalised.y * 2.0, 0.0, 1.0);
}

fn quadCorner(vertexIndex : u32) -> vec2f {
    var corners = array<vec2f, 6>(
        vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0),
        vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0),
    );
    return corners[vertexIndex];
}

fn fullscreenTriangle(vertexIndex : u32) -> vec4f {
    var corners = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
    return vec4f(corners[vertexIndex], 0.0, 1.0);
}
