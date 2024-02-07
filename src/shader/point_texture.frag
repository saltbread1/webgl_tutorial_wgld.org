precision mediump float;

uniform sampler2D texture0;
uniform bool isTexture;
varying vec4 vColor;

void main()
{
    if (isTexture)
    {
        vec4 sampColor0 = texture2D(texture0, gl_PointCoord);
        if (sampColor0.a < 0.5) { discard; }
        gl_FragColor = vColor * vec4(sampColor0.rgb, 1.0);
    }
    else
    {
        gl_FragColor = vColor;
    }
}
