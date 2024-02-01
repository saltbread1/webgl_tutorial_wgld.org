precision mediump float;

uniform sampler2D texture0;
uniform sampler2D texture1;
varying vec4 vColor;

void main()
{
    vec4 sampColor0 = texture2D(texture0, gl_PointCoord);
    vec4 sampColor1 = texture2D(texture1, gl_PointCoord);
    gl_FragColor = vColor * sampColor0 * sampColor1;
}
