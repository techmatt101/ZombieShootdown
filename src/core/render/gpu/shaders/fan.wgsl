const WARM_GLOW_GREEN_AT_CORE = 0.745;
const WARM_GLOW_GREEN_AT_EDGE = 0.471;

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
    return vec4f(brightness, light.isSight, 0.0, 0.0);
}

@fragment
fn glowMain(in : FanVertex) -> @location(0) vec4f {
    let light = lights[in.light];
    let fromCentre = clamp(distance(in.world, light.centre) / light.radius, 0.0, 1.0);
    let amount = (1.0 - fromCentre) * light.intensity * light.glow;
    let green = mix(WARM_GLOW_GREEN_AT_CORE, WARM_GLOW_GREEN_AT_EDGE, fromCentre);
    return vec4f(0.0, 0.0, amount, amount * green);
}
