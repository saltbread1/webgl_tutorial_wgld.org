precision mediump float;

#define KERNEL_SIZE 25

uniform vec2 resolution;
uniform float kernel[25];
uniform sampler2D texture0;
uniform bool isBlur;
varying vec4 vColor;
varying vec2 vTextureCoord;

void main()
{
    vec4 sampColor = vec4(0);
    if (isBlur)
    {
        for (int i = 0; i < 5; i++)
        {
            for (int j = 0; j < 5; j++)
            {
                float w = kernel[i + j * 5];
                vec2 off = vec2(i-2, j-2);
                vec2 uv = (gl_FragCoord.xy + off) / resolution;
                sampColor += texture2D(texture0, uv) * w;
            }
        }
    }
    else
    {
        vec2 uv = gl_FragCoord.xy / resolution;
        sampColor = texture2D(texture0, uv);
    }

    gl_FragColor = vColor * sampColor;
}
