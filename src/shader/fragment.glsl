#ifdef GL_ES
precision mediump float;
#endif

const float PI = acos(-1.);

uniform vec2 resolution;
uniform float time;

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    uv = (uv + vec2(cos(time * PI), sin(time * PI)) + 2.0) * 0.25;
    vec3 col = uv.xyy;
    gl_FragColor = vec4(col, 1.0);
}
