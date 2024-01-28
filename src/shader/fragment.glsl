#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D texture0;
uniform sampler2D texture1;
uniform mat4 invMatrix;
uniform vec3 lightDirection;
uniform vec3 lightPosition;
uniform vec3 eyeDirection;
uniform vec4 ambientColor;
uniform bool isLight;
uniform bool isTexture;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vTextureCoord;

void main() {
    vec3 lightVec = lightPosition - vPosition;
    vec3 invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    vec3 invEye = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;
    float diffse = clamp(dot(vNormal, invLight), 0.0, 1.0);
    vec3 reflectDirection = reflect(-invLight, vNormal);
    float specular = pow(clamp(dot(reflectDirection, invEye), 0.0, 1.0), 16.0);
    vec4 texColor0 = texture2D(texture0, vTextureCoord);
    vec4 texColor1 = texture2D(texture1, vTextureCoord);
    vec4 color = isTexture ? texColor0 : vColor;
    vec4 light = color * vec4(vec3(diffse + specular), 1.0) + ambientColor;
    gl_FragColor = isLight ? light : color;
}
