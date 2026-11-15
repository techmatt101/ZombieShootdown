const WARM_GLOW_CORE = vec4f(1.0, 0.745, 0.353, 1.0);
const WARM_GLOW_EDGE = vec4f(1.0, 0.471, 0.118, 0.0);

struct FanVertex {
    @builtin(position) position : vec4f,
    @location(0) world : vec2f,
    @location(1) @interpolate(flat) light : u32,
};

@vertex
fn vertexMain(@location(0) world : vec2f, @builtin(instance_index) light : u32) -> FanVertex {
    var out : FanVertex;
    out.position = worldToClip(world);
    out.world = world;
    out.light = light;
    return out;
}

@fragment
fn brightnessMain(in : FanVertex) -> @location(0) vec4f {
    let light = lights[in.light];
    let uv = (in.world - light.centre) / (2.0 * light.radius) + 0.5;
    let brightness = textureSampleLevel(visionTexture, smoothSampler, uv, 0.0).a * light.intensity;
    return vec4f(brightness, 0.0, 0.0, brightness);
}

@fragment
fn glowMain(in : FanVertex) -> @location(0) vec4f {
    let light = lights[in.light];
    let fromCentre = clamp(distance(in.world, light.centre) / light.radius, 0.0, 1.0);
    let colour = mix(WARM_GLOW_CORE, WARM_GLOW_EDGE, fromCentre);
    let alpha = colour.a * light.intensity * light.glow;
    return vec4f(colour.rgb * alpha, alpha);
}

@fragment
fn stencilMain() -> @location(0) vec4f {
    return vec4f(0.0);
}
