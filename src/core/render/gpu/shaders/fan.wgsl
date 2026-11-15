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
fn brightnessMain(in : FanVertex) -> LightOutput {
    let light = lights[in.light];
    var out : LightOutput;
    out.light = vec4f(light.colour * reachOf(light, in.world), light.isSight * coneOf(light, in.world));
    out.glow = vec4f(0.0);
    return out;
}

@fragment
fn glowMain(in : FanVertex) -> LightOutput {
    let light = lights[in.light];
    let fromCentre = clamp(distance(in.world, light.centre) / light.radius, 0.0, 1.0);
    let amount = (1.0 - fromCentre) * light.intensity * light.glow;
    var out : LightOutput;
    out.light = vec4f(0.0);
    out.glow = vec4f(light.glowColour * amount, 0.0);
    return out;
}
