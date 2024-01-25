#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform mat4 invMatrix;
uniform vec3 lightDirection;
uniform vec3 lightPosition;
uniform vec3 eyeDirection;
uniform vec4 ambientColor;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;

void main() {
    vec3 lightVec = lightDirection;//lightPosition - vPosition;
    vec3 invLight = normalize(invMatrix * vec4(lightVec, 0.0)).xyz;
    vec3 invEye = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;
    float diffse = clamp(dot(vNormal, invLight), 0.0, 1.0);
    vec3 reflectDirection = reflect(-invLight, vNormal);
    float specular = pow(clamp(dot(reflectDirection, invEye), 0.0, 1.0), 16.0);
    vec4 light = vColor * vec4(vec3(diffse + specular), 1.0);
    gl_FragColor = light + ambientColor;
}
