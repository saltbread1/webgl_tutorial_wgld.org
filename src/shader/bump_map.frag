precision mediump float;

uniform sampler2D texture0;
uniform float height;
varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vEyeDirection;
varying vec3 vLightDirection;

void main(void)
{
    vec3 dir = normalize(vLightDirection);
    vec3 eye = normalize(vEyeDirection);
    float hScale = texture2D(texture0, vTextureCoord).a * height;
    vec2 hTexCoord = vTextureCoord - hScale * eye.xy;
    vec3 mNormal = texture2D(texture0, hTexCoord).rgb * 2.0 - 1.0;
    float dif = clamp(dot(mNormal, dir), 0.1, 1.0);
    vec3 ref = reflect(-dir, mNormal);
    float spe = pow(clamp(dot(ref, eye), 0.0, 1.0), 16.0);
    vec4 light = vColor * vec4(vec3(dif + spe), 1.0);
    gl_FragColor = light;
}
