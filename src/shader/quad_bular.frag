#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolusion;
uniform sampler2D texture0;
uniform bool isTexture;
varying vec4 vColor;
varying vec2 vTextureCoord;

void main() {
    vec2 uv = gl_FragCoord.xy / resolusion;
    float[25] wArr = float[](0.02, 0.02, 0.02, 0.02, 0.02,
                             0.02, 0.04, 0.04, 0.04, 0.02,
                             0.02, 0.04, 0.36, 0.04, 0.02,
                             0.02, 0.04, 0.04, 0.04, 0.02,
                             0.02, 0.02, 0.02, 0.02, 0.02);
    vec4 color = vec4(0);
    for (int i = 0; i < 5; i++) {
        for (int j = 0; j < 5; j++) {
            float w = wArr[i + j * 5];
            vec2 off = vec2(i-2, j-2);
            color += texture2D(texture0, uv);
        }
    }

    gl_FragColor = vColor * color;
}
