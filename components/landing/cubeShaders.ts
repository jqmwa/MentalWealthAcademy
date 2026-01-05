export const cubeFragmentShader = `precision highp float;

uniform vec3 ucolor1;
uniform vec3 ucolor2;
uniform vec3 ucolor3;
uniform vec3 ucolor4;
uniform vec3 ucolor5;
uniform float asciicode;
uniform sampler2D utexture;
uniform float brightness;
uniform float asciiu;
uniform vec2 resolution;
uniform float time;

varying vec2 vUv;
varying vec2 aPixelUV;
varying vec3 vPosition;
varying vec3 vNormal;

// Barrel distortion
vec2 barrelDistortion(vec2 uv, float strength) {
    vec2 center = vec2(0.5, 0.5);
    vec2 coord = uv - center;
    float dist = length(coord);
    float factor = 1.0 + strength * dist * dist;
    return center + coord * factor;
}

// Simple ASCII-like pattern
float asciiPattern(vec2 uv, float code) {
    vec2 grid = floor(uv * code);
    vec2 cell = fract(uv * code);
    float pattern = step(0.5, cell.x) * step(0.5, cell.y);
    return pattern;
}

void main() {
    // Position math
    vec2 uv = vUv;
    vec2 pos = vPosition.xy;
    
    // Barrel distortion
    vec2 distortedUV = barrelDistortion(uv, 0.1);
    
    // ASCII texture effect
    float asciiValue = asciiPattern(distortedUV, asciicode);
    float asciiBrightness = asciiu * asciiValue;
    
    // Sample texture
    vec4 textureColor = texture2D(utexture, aPixelUV);
    
    // Combine colors based on position and normal
    vec3 color1 = ucolor1;
    vec3 color2 = ucolor2;
    vec3 color3 = ucolor3;
    vec3 color4 = ucolor4;
    vec3 color5 = ucolor5;
    
    // Mix colors based on position
    float mixFactor = (vNormal.x + vNormal.y + vNormal.z) * 0.33 + 0.5;
    vec3 baseColor = mix(color1, color2, mixFactor);
    baseColor = mix(baseColor, color3, vPosition.z * 0.5 + 0.5);
    baseColor = mix(baseColor, color4, distortedUV.x);
    baseColor = mix(baseColor, color5, distortedUV.y);
    
    // Apply texture color
    baseColor = mix(baseColor, textureColor.rgb, textureColor.a);
    
    // Apply ASCII brightness and depth
    baseColor *= (brightness + asciiBrightness);
    
    // Final color with depth
    vec3 finalColor = baseColor * (1.0 + asciiu * 0.2);
    
    gl_FragColor = vec4(finalColor, 1.0);
}`;

export const cubeVertexShader = `precision highp float;

uniform float time;
uniform vec3 rotationSpeed;

varying vec2 vUv;
varying vec2 aPixelUV;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vUv = uv;
    aPixelUV = uv;
    
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
}`;
