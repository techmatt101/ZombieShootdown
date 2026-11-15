struct Camera {
    view : vec4f,
    viewport : vec4f,
};

struct Light {
    centre : vec2f,
    radius : f32,
    intensity : f32,
    glow : f32,
    unused0 : f32,
    unused1 : f32,
    unused2 : f32,
};

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
