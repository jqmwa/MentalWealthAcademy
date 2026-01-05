precision highp float;

uniform float time;
uniform vec3 rotationSpeed;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    // Apply unique rotation per cube (rotationSpeed passed as uniform)
    float rotX = time * rotationSpeed.x;
    float rotY = time * rotationSpeed.y;
    float rotZ = time * rotationSpeed.z;
    
    // Rotate around X axis
    float cosX = cos(rotX);
    float sinX = sin(rotX);
    float y1 = pos.y * cosX - pos.z * sinX;
    float z1 = pos.y * sinX + pos.z * cosX;
    
    // Rotate around Y axis
    float cosY = cos(rotY);
    float sinY = sin(rotY);
    float x2 = pos.x * cosY + z1 * sinY;
    float z2 = -pos.x * sinY + z1 * cosY;
    
    // Rotate around Z axis
    float cosZ = cos(rotZ);
    float sinZ = sin(rotZ);
    float x3 = x2 * cosZ - y1 * sinZ;
    float y3 = x2 * sinZ + y1 * cosZ;
    
    vec3 rotatedPos = vec3(x3, y3, z2);
    
    vec4 modelPosition = modelMatrix * vec4(rotatedPos, 1.0);
    vPosition = modelPosition.xyz;
    
    // Transform normal
    vec3 transformedNormal = normalMatrix * normal;
    vNormal = normalize(transformedNormal);
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
}
