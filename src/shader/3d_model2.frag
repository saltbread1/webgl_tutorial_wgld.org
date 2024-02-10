precision mediump float;

uniform mat4 invMatrix;
uniform vec3 lightPosition;
uniform vec3 eyePosition;
uniform vec4 ambientColor;
uniform sampler2D texture0;
uniform bool isLight;
uniform bool isTexture;
varying vec3 vPositon;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vTextureCoord;

void main()
{
    vec3 lightDirection = lightPosition - vPositon;
    vec3 eyeDirection = eyePosition - vPositon;
    vec3 invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    vec3 invEye = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;
    float diffse = clamp(dot(vNormal, invLight), 0.0, 1.0);
    vec3 reflectDirection = reflect(-invLight, vNormal);
    float specular = pow(clamp(dot(reflectDirection, invEye), 0.0, 1.0), 16.0);
    vec4 color = isTexture ? vColor * texture2D(texture0, vTextureCoord) : vColor;
    vec4 light = color * vec4(vec3(diffse + specular), 1.0) + ambientColor;
    gl_FragColor = isLight ? light : color;
}
